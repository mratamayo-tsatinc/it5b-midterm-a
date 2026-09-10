/*
@output
Number Classification

1 - Small
2 - Small
3 - Small
4 - Medium
5 - Medium
6 - Medium
7 - Medium
8 - Large
9 - Large
10 - Large

END OF PROGRAM
@variables
i = 11
*/
#include <stdio.h>

int main() {
    printf("Number Classification\n");
    printf("\n");

    for (int i = 1; i <= 10; i++) {
        if (i <= 3) {
            printf("%d - Small\n", i);
        } else if (i <= 7) {
            printf("%d - Medium\n", i);
        } else {
            printf("%d - Large\n", i);
        }
    }

    printf("\nEND OF PROGRAM");

    return 0;
}
