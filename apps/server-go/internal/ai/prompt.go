package ai

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

type FilePromptLoader struct {
	Dir string
}

func NewFilePromptLoader(dir string) FilePromptLoader {
	return FilePromptLoader{Dir: dir}
}

func (l FilePromptLoader) LoadPrompt(ctx Context, code string) (string, error) {
	if err := ctx.Err(); err != nil {
		return "", err
	}
	path, err := l.promptPath(code)
	if err != nil {
		return "", err
	}
	content, err := os.ReadFile(path)
	if os.IsNotExist(err) {
		return "", fmt.Errorf("%w: %s", ErrPromptNotFound, code)
	}
	if err != nil {
		return "", err
	}
	return string(content), nil
}

func (l FilePromptLoader) promptPath(code string) (string, error) {
	if strings.TrimSpace(l.Dir) == "" {
		return "", ErrPromptNotFound
	}
	code = strings.TrimSpace(code)
	if code == "" || code == "." || code == ".." || strings.Contains(code, "/") || strings.Contains(code, "\\") {
		return "", ErrInvalidPromptCode
	}
	return filepath.Join(l.Dir, code+".md"), nil
}

func RenderPrompt(template string, params map[string]any) (string, error) {
	var b strings.Builder
	missing := map[string]struct{}{}
	for i := 0; i < len(template); {
		if strings.HasPrefix(template[i:], "{{") {
			b.WriteByte('{')
			i += 2
			continue
		}
		if strings.HasPrefix(template[i:], "}}") {
			b.WriteByte('}')
			i += 2
			continue
		}
		if template[i] != '{' {
			b.WriteByte(template[i])
			i++
			continue
		}

		end := strings.IndexByte(template[i+1:], '}')
		if end < 0 {
			b.WriteByte(template[i])
			i++
			continue
		}
		key := strings.TrimSpace(template[i+1 : i+1+end])
		if key == "" {
			b.WriteString("{}")
			i += end + 2
			continue
		}
		value, ok := params[key]
		if !ok {
			missing[key] = struct{}{}
			b.WriteString("{")
			b.WriteString(key)
			b.WriteString("}")
			i += end + 2
			continue
		}
		b.WriteString(fmt.Sprint(value))
		i += end + 2
	}
	if len(missing) > 0 {
		keys := make([]string, 0, len(missing))
		for key := range missing {
			keys = append(keys, key)
		}
		sort.Strings(keys)
		return b.String(), fmt.Errorf("missing prompt params: %s", strings.Join(keys, ", "))
	}
	return b.String(), nil
}
