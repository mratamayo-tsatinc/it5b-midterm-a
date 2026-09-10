/*
@output
Number Analysis

1 - Odd
2 - Even
3 - Odd
4 - Multiple of 4
5 - Odd
6 - Even
7 - Odd
8 - Multiple of 4

END OF ANALYSIS
@variables
i = 9
*/
#include <stdio.h>

int main() {
    printf("Number Analysis\n");
    printf("\n");

    int i = 1;
    while (i <= 8) {
        if (i % 2 == 0 && i % 4 == 0) {
            printf("%d - Multiple of 4\n", i);
        } else if (i % 2 == 0) {
            printf("%d - Even\n", i);
        } else {
            printf("%d - Odd\n", i);
        }
        i++;
    }

    printf("\nEND OF ANALYSIS");

    return 0;
}
