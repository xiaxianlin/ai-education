package ai

import (
	"fmt"
	"reflect"
	"strings"
)

func ValidateGeneratedQuestions(questions []GeneratedQuestion) error {
	if len(questions) == 0 {
		return fmt.Errorf("%w: questions is empty", ErrInvalidSchema)
	}
	for i, question := range questions {
		if err := ValidateGeneratedQuestion(question); err != nil {
			return fmt.Errorf("questions[%d]: %w", i, err)
		}
	}
	return nil
}

func ValidateGeneratedQuestion(question GeneratedQuestion) error {
	if strings.TrimSpace(question.Content.Stem) == "" {
		return fmt.Errorf("%w: content.stem is required", ErrInvalidSchema)
	}
	if err := validateResource("content.resource", question.Content.Resource); err != nil {
		return err
	}
	if err := validateOptions(question.Content.Options); err != nil {
		return err
	}
	if err := validateAnswer(question.Answer); err != nil {
		return err
	}
	if err := validateDifficulty(question.Difficulty); err != nil {
		return err
	}
	return validateQuestionTypeShape(question)
}

func validateResource(path string, resource *Resource) error {
	if resource == nil {
		return nil
	}
	switch resource.Type {
	case "image":
		if strings.TrimSpace(resource.URL) == "" && strings.TrimSpace(resource.ImagePrompt) == "" {
			return fmt.Errorf("%w: %s.image_prompt or %s.url is required", ErrInvalidSchema, path, path)
		}
	case "audio":
		if strings.TrimSpace(resource.URL) == "" && strings.TrimSpace(resource.TTSText) == "" {
			return fmt.Errorf("%w: %s.tts_text or %s.url is required", ErrInvalidSchema, path, path)
		}
	default:
		return fmt.Errorf("%w: %s.type must be image or audio", ErrInvalidSchema, path)
	}
	return nil
}

func validateOptions(options []Option) error {
	seen := map[string]struct{}{}
	for i, option := range options {
		if strings.TrimSpace(option.ID) == "" {
			return fmt.Errorf("%w: content.options[%d].id is required", ErrInvalidSchema, i)
		}
		if strings.TrimSpace(option.Text) == "" && option.Resource == nil {
			return fmt.Errorf("%w: content.options[%d].text or resource is required", ErrInvalidSchema, i)
		}
		if _, ok := seen[option.ID]; ok {
			return fmt.Errorf("%w: duplicate option id %q", ErrInvalidSchema, option.ID)
		}
		seen[option.ID] = struct{}{}
		if err := validateResource(fmt.Sprintf("content.options[%d].resource", i), option.Resource); err != nil {
			return err
		}
	}
	return nil
}

func validateAnswer(answer QuestionAnswer) error {
	switch answer.AnalysisMode {
	case "objective":
	case "subjective":
		if len(answer.Rubrics) == 0 {
			return fmt.Errorf("%w: subjective answer requires rubrics", ErrInvalidSchema)
		}
	default:
		return fmt.Errorf("%w: answer.analysis_mode must be objective or subjective", ErrInvalidSchema)
	}
	if answer.CorrectValue == nil && answer.Value == nil {
		return fmt.Errorf("%w: answer.correct_value is required", ErrInvalidSchema)
	}
	for i, rubric := range answer.Rubrics {
		if strings.TrimSpace(rubric.Dimension) == "" {
			return fmt.Errorf("%w: answer.rubrics[%d].dimension is required", ErrInvalidSchema, i)
		}
		if rubric.MaxScore <= 0 {
			return fmt.Errorf("%w: answer.rubrics[%d].max_score must be positive", ErrInvalidSchema, i)
		}
	}
	return nil
}

func validateDifficulty(difficulty string) error {
	switch difficulty {
	case "", "easy", "medium", "hard":
		return nil
	default:
		return fmt.Errorf("%w: difficulty must be easy, medium, or hard", ErrInvalidSchema)
	}
}

func validateQuestionTypeShape(question GeneratedQuestion) error {
	code := strings.ToLower(strings.TrimSpace(question.QuestionTypeCode))
	if code == "" {
		return nil
	}
	correctValue := question.Answer.CorrectValue
	if correctValue == nil {
		correctValue = question.Answer.Value
	}
	switch code {
	case "choice", "judge":
		if len(question.Content.Options) < 2 {
			return fmt.Errorf("%w: %s question requires at least two options", ErrInvalidSchema, code)
		}
		correct, ok := stringAnswer(correctValue)
		if !ok {
			return fmt.Errorf("%w: %s question requires string correct_value", ErrInvalidSchema, code)
		}
		if !hasOptionID(question.Content.Options, correct) {
			return fmt.Errorf("%w: correct_value %q is not in options", ErrInvalidSchema, correct)
		}
	case "sorting":
		values, ok := sliceAnswer(correctValue)
		if !ok || len(values) == 0 {
			return fmt.Errorf("%w: sorting question requires non-empty correct_value array", ErrInvalidSchema)
		}
		if len(values) != len(question.Content.Options) {
			return fmt.Errorf("%w: sorting correct_value length must match options length", ErrInvalidSchema)
		}
		for _, value := range values {
			id, ok := stringAnswer(value)
			if !ok || !hasOptionID(question.Content.Options, id) {
				return fmt.Errorf("%w: sorting correct_value contains unknown option %v", ErrInvalidSchema, value)
			}
		}
	case "matching":
		mapping, ok := mapAnswer(correctValue)
		if !ok || len(mapping) == 0 {
			return fmt.Errorf("%w: matching question requires non-empty correct_value object", ErrInvalidSchema)
		}
		for left, right := range mapping {
			rightID, ok := stringAnswer(right)
			if !ok || !hasOptionID(question.Content.Options, left) || !hasOptionID(question.Content.Options, rightID) {
				return fmt.Errorf("%w: matching pair %q -> %v references unknown option", ErrInvalidSchema, left, right)
			}
		}
	case "input":
		return nil
	}
	return nil
}

func hasOptionID(options []Option, id string) bool {
	for _, option := range options {
		if option.ID == id {
			return true
		}
	}
	return false
}

func stringAnswer(value any) (string, bool) {
	s, ok := value.(string)
	return s, ok && strings.TrimSpace(s) != ""
}

func sliceAnswer(value any) ([]any, bool) {
	if value == nil {
		return nil, false
	}
	if values, ok := value.([]any); ok {
		return values, true
	}
	rv := reflect.ValueOf(value)
	if rv.Kind() != reflect.Slice && rv.Kind() != reflect.Array {
		return nil, false
	}
	values := make([]any, 0, rv.Len())
	for i := 0; i < rv.Len(); i++ {
		values = append(values, rv.Index(i).Interface())
	}
	return values, true
}

func mapAnswer(value any) (map[string]any, bool) {
	if value == nil {
		return nil, false
	}
	if values, ok := value.(map[string]any); ok {
		return values, true
	}
	rv := reflect.ValueOf(value)
	if rv.Kind() != reflect.Map || rv.Type().Key().Kind() != reflect.String {
		return nil, false
	}
	values := make(map[string]any, rv.Len())
	iter := rv.MapRange()
	for iter.Next() {
		values[iter.Key().String()] = iter.Value().Interface()
	}
	return values, true
}
