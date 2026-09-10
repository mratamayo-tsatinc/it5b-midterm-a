/*
@output
Number: 10
1
4
9
16
25
36
49
64
81
100


END OF PROGRAM
@variables
number = 10
i = 11
*/
#include <stdio.h>

int main() {
    int number = 10;

    printf("Number: %d\n", number);

    int i = 1;

    while (i <= number) {
        printf("%d\n", i * i);
        i++;
    }

    printf("\n\nEND OF PROGRAM");

    return 0;
}
