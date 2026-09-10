/*
@output
Operation Log

1 - Multiply: 1
2 - Count: 1
3 - Add: 3
4 - Multiply: 4
5 - Count: 2
6 - Add: 9

Summary:
Sum = 9
Product = 4
Count = 2
Last = 6

@variables
i = 7
sum = 9
product = 4
count = 2
last = 6
*/
#include <stdio.h>

int main() {
    int sum = 0;
    int product = 1;
    int count = 0;
    int last = 0;

    printf("Operation Log\n");
    printf("\n");

    for (int i = 1; i <= 6; i++) {
        last = i;
        switch (i % 3) {
            case 0:
                sum += i;
                printf("%d - Add: %d\n", i, sum);
                break;
            case 1:
                product *= i;
                printf("%d - Multiply: %d\n", i, product);
                break;
            case 2:
                count++;
                printf("%d - Count: %d\n", i, count);
                break;
        }
    }

    printf("\n");
    printf("Summary:\n");
    printf("Sum = %d\n", sum);
    printf("Product = %d\n", product);
    printf("Count = %d\n", count);
    printf("Last = %d\n", last);

    return 0;
}
