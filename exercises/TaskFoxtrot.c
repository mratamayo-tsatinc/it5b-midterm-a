/*
@output
Positive integer: 20

2
4
6
8
10
12
14
16
18
20


Sum of even numbers from 1 to 20: 110


END OF PROGRAM
@variables
n = 20
sum = 110
i = 21
*/
#include <stdio.h>

int main() {
    int n = 20;
    int sum = 0;

    printf("Positive integer: %d\n", n);
    printf("\n");

    int i = 1;

    while (i <= n) {
        if (i % 2 == 0) {
            printf("%d\n", i);
            sum += i;
        }
        i++;
    }

    printf("\n\nSum of even numbers from 1 to %d: %d\n", n, sum);
    printf("\n\nEND OF PROGRAM");

    return 0;
}
