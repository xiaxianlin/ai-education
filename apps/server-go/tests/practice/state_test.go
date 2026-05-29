package practice_test

import (
	"testing"

	"ai-education/server-go/internal/practice"
)

func TestResolveStatePrefersGenerateStatus(t *testing.T) {
	tests := []struct {
		name           string
		generateStatus int
		status         int
		wantStep       string
		wantProgress   int
	}{
		{
			name:           "generating overrides completed status",
			generateStatus: practice.GenerateStatusGenerating,
			status:         practice.PracticeStatusCompleted,
			wantStep:       "generating",
			wantProgress:   0,
		},
		{
			name:           "failed overrides in progress status",
			generateStatus: practice.GenerateStatusFailed,
			status:         practice.PracticeStatusInProgress,
			wantStep:       "failed",
			wantProgress:   0,
		},
		{
			name:           "completed generation uses session status",
			generateStatus: practice.GenerateStatusCompleted,
			status:         practice.PracticeStatusInProgress,
			wantStep:       "in_progress",
			wantProgress:   100,
		},
		{
			name:           "completed session after completed generation",
			generateStatus: practice.GenerateStatusCompleted,
			status:         practice.PracticeStatusCompleted,
			wantStep:       "completed",
			wantProgress:   100,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := practice.ResolveState(practice.Practice{
				GenerateStatus: tt.generateStatus,
				Status:         tt.status,
			})

			if got.Step != tt.wantStep {
				t.Fatalf("step = %q, want %q", got.Step, tt.wantStep)
			}
			if got.Progress != tt.wantProgress {
				t.Fatalf("progress = %d, want %d", got.Progress, tt.wantProgress)
			}
		})
	}
}
