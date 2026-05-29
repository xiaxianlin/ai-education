package ai

import (
	"encoding/json"
	"fmt"
	"math"
	"reflect"
	"strconv"
	"strings"
)

type ObjectiveAnswerEvaluator struct{}

func (ObjectiveAnswerEvaluator) EvaluateAnswer(ctx Context, req EvaluateAnswerRequest) (EvaluateAnswerResult, error) {
	if err := ctx.Err(); err != nil {
		return EvaluateAnswerResult{}, err
	}
	if req.ExpectedAnswer.AnalysisMode != "objective" {
		return EvaluateAnswerResult{}, ErrRequiresAI
	}

	correctValue := req.ExpectedAnswer.CorrectValue
	if correctValue == nil {
		correctValue = req.ExpectedAnswer.Value
	}
	if correctValue == nil {
		return EvaluateAnswerResult{}, fmt.Errorf("%w: expected answer is empty", ErrInvalidSchema)
	}

	fullScore := fullScore(req.ExpectedAnswer)
	isCorrect := evaluateObjective(req.QuestionTypeCode, req.StudentAnswer, correctValue)
	score := 0.0
	if isCorrect {
		score = fullScore
	}

	return EvaluateAnswerResult{
		IsCorrect:     isCorrect,
		Score:         score,
		FullScore:     fullScore,
		CorrectAnswer: buildCorrectAnswer(req.QuestionTypeCode, correctValue),
		Analysis: AnswerAnalysis{
			CorrectAnswer: correctValue,
			Explanation:   req.ExpectedAnswer.Explanation,
		},
		Metadata: map[string]any{
			"evaluator": "objective",
		},
	}, nil
}

func evaluateObjective(questionTypeCode string, student any, correct any) bool {
	switch strings.ToLower(strings.TrimSpace(questionTypeCode)) {
	case "sorting":
		return orderedSliceEqual(student, correct)
	case "matching":
		return mapEqual(student, correct)
	default:
		if variants, ok := sliceAnswer(correct); ok {
			for _, variant := range variants {
				if scalarEqual(student, variant) {
					return true
				}
			}
			return false
		}
		if _, ok := mapAnswer(correct); ok {
			return mapEqual(student, correct)
		}
		return scalarEqual(student, correct)
	}
}

func buildCorrectAnswer(questionTypeCode string, correct any) CorrectAnswer {
	switch strings.ToLower(strings.TrimSpace(questionTypeCode)) {
	case "sorting":
		return CorrectAnswer{Type: "order", Values: anySlice(correct)}
	case "matching":
		return CorrectAnswer{Type: "mapping", Value: correct}
	default:
		if values, ok := sliceAnswer(correct); ok {
			return CorrectAnswer{Type: "values", Values: values}
		}
		return CorrectAnswer{Type: "value", Value: correct}
	}
}

func fullScore(answer QuestionAnswer) float64 {
	if answer.Configs != nil {
		if score, ok := numericValue(answer.Configs["full_score"]); ok && score > 0 {
			return score
		}
		if score, ok := numericValue(answer.Configs["score"]); ok && score > 0 {
			return score
		}
	}
	total := 0.0
	for _, rubric := range answer.Rubrics {
		total += rubric.MaxScore
	}
	if total > 0 {
		return total
	}
	return 1
}

func orderedSliceEqual(student any, correct any) bool {
	left, ok := sliceAnswer(student)
	if !ok {
		return false
	}
	right, ok := sliceAnswer(correct)
	if !ok || len(left) != len(right) {
		return false
	}
	for i := range left {
		if !scalarEqual(left[i], right[i]) {
			return false
		}
	}
	return true
}

func mapEqual(student any, correct any) bool {
	left, ok := mapAnswer(student)
	if !ok {
		return false
	}
	right, ok := mapAnswer(correct)
	if !ok || len(left) != len(right) {
		return false
	}
	for key, expected := range right {
		actual, ok := left[key]
		if !ok || !scalarEqual(actual, expected) {
			return false
		}
	}
	return true
}

func scalarEqual(left any, right any) bool {
	if left == nil || right == nil {
		return left == right
	}
	if leftNumber, ok := numericValue(left); ok {
		if rightNumber, ok := numericValue(right); ok {
			return math.Abs(leftNumber-rightNumber) < 1e-9
		}
	}
	if leftBool, ok := boolValue(left); ok {
		if rightBool, ok := boolValue(right); ok {
			return leftBool == rightBool
		}
	}
	leftString := normalizedString(left)
	rightString := normalizedString(right)
	if leftString != "" || rightString != "" {
		return strings.EqualFold(leftString, rightString)
	}
	return reflect.DeepEqual(left, right)
}

func normalizedString(value any) string {
	switch v := value.(type) {
	case string:
		return strings.Join(strings.Fields(strings.TrimSpace(v)), " ")
	case fmt.Stringer:
		return strings.Join(strings.Fields(strings.TrimSpace(v.String())), " ")
	default:
		return strings.Join(strings.Fields(strings.TrimSpace(fmt.Sprint(v))), " ")
	}
}

func numericValue(value any) (float64, bool) {
	switch v := value.(type) {
	case json.Number:
		f, err := v.Float64()
		return f, err == nil
	case int:
		return float64(v), true
	case int8:
		return float64(v), true
	case int16:
		return float64(v), true
	case int32:
		return float64(v), true
	case int64:
		return float64(v), true
	case uint:
		return float64(v), true
	case uint8:
		return float64(v), true
	case uint16:
		return float64(v), true
	case uint32:
		return float64(v), true
	case uint64:
		return float64(v), true
	case float32:
		return float64(v), true
	case float64:
		return v, true
	case string:
		f, err := strconv.ParseFloat(strings.TrimSpace(v), 64)
		return f, err == nil
	default:
		return 0, false
	}
}

func boolValue(value any) (bool, bool) {
	switch v := value.(type) {
	case bool:
		return v, true
	case string:
		switch strings.ToLower(strings.TrimSpace(v)) {
		case "true", "yes", "y", "1", "正确", "对":
			return true, true
		case "false", "no", "n", "0", "错误", "错":
			return false, true
		default:
			return false, false
		}
	default:
		return false, false
	}
}

func anySlice(value any) []any {
	values, ok := sliceAnswer(value)
	if !ok {
		return nil
	}
	return values
}
