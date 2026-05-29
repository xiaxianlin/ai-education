package ability

type Ability struct {
	ID          int64   `json:"id"`
	Subject     string  `json:"subject"`
	Grade       int     `json:"grade"`
	Code        string  `json:"code"`
	Name        string  `json:"name"`
	Description *string `json:"description,omitempty"`
	Difficulty  int     `json:"difficulty"`
	IsActive    int     `json:"is_active"`
	CreateTime  int64   `json:"create_time"`
	UpdateTime  int64   `json:"update_time"`
}

type CreateAbilityRequest struct {
	Subject     string  `json:"subject"`
	Grade       int     `json:"grade"`
	Code        string  `json:"code"`
	Name        string  `json:"name"`
	Description *string `json:"description,omitempty"`
	Difficulty  *int    `json:"difficulty,omitempty"`
}

type UpdateAbilityRequest struct {
	Name        *string `json:"name,omitempty"`
	Code        *string `json:"code,omitempty"`
	Description *string `json:"description,omitempty"`
	Difficulty  *int    `json:"difficulty,omitempty"`
	IsActive    *int    `json:"is_active,omitempty"`
}

type BatchDeleteAbilityRequest struct {
	IDs []int64 `json:"ids"`
}

type SearchAbilityParams struct {
	Subject *string
	Grade   *int
}

type CreateAbility struct {
	Subject     string  `json:"subject"`
	Grade       int     `json:"grade"`
	Code        string  `json:"code"`
	Name        string  `json:"name"`
	Description *string `json:"description,omitempty"`
	Difficulty  int     `json:"difficulty"`
}

type NullableString struct {
	Set   bool
	Value *string
}

type UpdateAbilityPatch struct {
	Name        *string
	Code        *string
	Description NullableString
	Difficulty  *int
	IsActive    *int
}

type ImportAbilitiesResult struct {
	DeletedCount int `json:"deleted_count"`
	CreatedCount int `json:"created_count"`
}
