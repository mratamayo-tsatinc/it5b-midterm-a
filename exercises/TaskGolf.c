/*
@output
232-23-2-0-
Number of digits: 4
@variables
number = 0
count = 4
*/
#include <stdio.h>

int main() {
    int number = 2322;
    int count = 0;

    while (number != 0) {
        number /= 10;
        printf("%d-", number);
        count++;
    }

    printf("\nNumber of digits: %d\n", count);

    return 0;
}
