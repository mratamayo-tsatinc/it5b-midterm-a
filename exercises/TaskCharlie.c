/*
@output
number = 8
5
10
15
20
25
30
35
40
**********

@variables
number = 8
i = 9
result = 40
*/
#include <stdio.h>

int main() {
    int number;

    number = 8;

    printf("number = %d\n", number);

    for (int i = 1; i <= number; i++) {
        int result = i * 5;
        printf("%d\n", result);
    }

    printf("**********\n");

    return 0;
}
