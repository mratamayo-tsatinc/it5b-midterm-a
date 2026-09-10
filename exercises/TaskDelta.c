/*
@output
Positive integer: 10

1
###
3
###
5
###
7
###
9
###

@variables
n = 10
i = 11
*/
#include <stdio.h>

int main() {
    int n = 10;

    printf("Positive integer: %d\n", n);
    printf("\n");

    for (int i = 1; i <= n; i++) {
        if (i % 2 != 0) {
            printf("%d\n", i);
            printf("###\n");
        }
    }

    return 0;
}
