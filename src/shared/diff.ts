import z from "zod";

export const TextChangeAction = z.enum(["replacement", "deletion", "addition"]);
export type TextChangeAction = z.infer<typeof TextChangeAction>;

export const TextChangeReplacement = z.object({
  action: z.literal(TextChangeAction.enum.replacement),
  original: z.string(),
  replacement: z.string(),
});
export type TextChangeReplacement = z.infer<typeof TextChangeReplacement>;

export const TextChangeDeletion = z.object({
  action: z.literal(TextChangeAction.enum.deletion),
  deleted: z.string(),
});
export type TextChangeDeletion = z.infer<typeof TextChangeDeletion>;

export const TextChangeAddition = z.object({
  action: z.literal(TextChangeAction.enum.addition),
  added: z.string(),
});
export type TextChangeAddition = z.infer<typeof TextChangeAddition>;

export const TextChange = TextChangeReplacement.or(TextChangeDeletion).or(TextChangeAddition);
export type TextChange = z.infer<typeof TextChange>;

export const TextChanges = TextChange.array();
export type TextChanges = z.infer<typeof TextChanges>;

export function diff(a: string, b: string): TextChanges {
    const wordsA = a.split(/\s+/).filter((w) => w.length > 0);
    const wordsB = b.split(/\s+/).filter((w) => w.length > 0);

    const n = wordsA.length;
    const m = wordsB.length;

    const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

    for (let i = 0; i <= n; i++) {
        dp[i][0] = i;
    }
    for (let j = 0; j <= m; j++) {
        dp[0][j] = j;
    }

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (wordsA[i - 1] === wordsB[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j - 1] + 1, // replace
                    dp[i - 1][j] + 1,     // delete
                    dp[i][j - 1] + 1      // add
                );
            }
        }
    }

    const changes: TextChange[] = [];
    let i = n;
    let j = m;

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && wordsA[i - 1] === wordsB[j - 1]) {
            i--;
            j--;
        } else {
            const originalWords: string[] = [];
            const newWords: string[] = [];
            while ((i > 0 || j > 0) && !(i > 0 && j > 0 && wordsA[i - 1] === wordsB[j - 1])) {
                if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
                    originalWords.push(wordsA[i - 1]);
                    newWords.push(wordsB[j - 1]);
                    i--;
                    j--;
                } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
                    originalWords.push(wordsA[i - 1]);
                    i--;
                } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
                    newWords.push(wordsB[j - 1]);
                    j--;
                } else {
                    throw new Error("Invalid path in diff computation");
                }
            }
            originalWords.reverse();
            newWords.reverse();
            const origStr = originalWords.join(" ");
            const newStr = newWords.join(" ");
            let change: TextChange;
            if (originalWords.length === 0) {
                change = { action: "addition" as const, added: newStr };
            } else if (newWords.length === 0) {
                change = { action: "deletion" as const, deleted: origStr };
            } else {
                change = { action: "replacement" as const, original: origStr, replacement: newStr };
            }
            changes.push(change);
        }
    }

    changes.reverse();
    return changes;
}
