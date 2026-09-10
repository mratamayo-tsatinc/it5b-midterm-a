/*
@output
START OF PROGRAM



Sum of numbers from 1 to 5: 0


END OF PROGRAM
@variables
sum = 0
i = 5
*/
#include <stdio.h>

int main() {
    int sum = 0;
    printf("START OF PROGRAM\n");
    printf("\n");
    for (int i = 5; i <= 1; i--) {
        printf("%d ", i);
        sum += i;
    }

    printf("\n\nSum of numbers from 1 to 5: %d\n", sum);
    printf("\n\nEND OF PROGRAM");

    return 0;
}
