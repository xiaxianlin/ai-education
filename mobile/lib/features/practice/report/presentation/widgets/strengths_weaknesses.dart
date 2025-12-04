import 'package:flutter/material.dart';

/// 优势与薄弱点组件
class StrengthsWeaknesses extends StatelessWidget {
  final List<String>? strengths;
  final List<String>? weaknesses;

  const StrengthsWeaknesses({
    super.key,
    this.strengths,
    this.weaknesses,
  });

  @override
  Widget build(BuildContext context) {
    final hasStrengths = strengths != null && strengths!.isNotEmpty;
    final hasWeaknesses = weaknesses != null && weaknesses!.isNotEmpty;

    if (!hasStrengths && !hasWeaknesses) {
      return const SizedBox.shrink();
    }

    return Row(
      children: [
        if (hasStrengths)
          Expanded(
            child: Card(
              elevation: 2,
              margin: const EdgeInsets.only(left: 16, right: 8, top: 8, bottom: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(16),
                ),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Text(
                          '✅',
                          style: TextStyle(fontSize: 20),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          '优势',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ...strengths!.map((strength) => Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(
                                Icons.check_circle,
                                size: 16,
                                color: Colors.green.shade700,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  strength,
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.green.shade800,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        )),
                  ],
                ),
              ),
            ),
          ),
        if (hasWeaknesses)
          Expanded(
            child: Card(
              elevation: 2,
              margin: const EdgeInsets.only(left: 8, right: 16, top: 8, bottom: 8),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.orange.shade50,
                  borderRadius: BorderRadius.circular(16),
                ),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Text(
                          '⚠️',
                          style: TextStyle(fontSize: 20),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          '薄弱点',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ...weaknesses!.map((weakness) => Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(
                                Icons.warning,
                                size: 16,
                                color: Colors.orange.shade700,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  weakness,
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.orange.shade800,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        )),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }
}

