/*
@output
Factors of 12:
1
2
3
4
6
12

@variables
number = 12
factor = 13
*/
#include <stdio.h>

int main() {
    int number = 12;
    int factor = 1;
    printf("Factors of %d:\n", number);
    do {
        if (number % factor == 0) {
            printf("%d\n", factor);
        }
        factor++;
    } while (factor <= number);

    printf("\n");

    return 0;
}
