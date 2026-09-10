/*
@output
Temperature Report

0 - Cold
5 - Cold
10 - Cold
15 - Warm
20 - Warm
25 - Warm
30 - Hot
35 - Hot
40 - Hot

END OF REPORT
@variables
temp = 45
*/
#include <stdio.h>

int main() {
    printf("Temperature Report\n");
    printf("\n");

    int temp = 0;
    do {
        if (temp <= 10) {
            printf("%d - Cold\n", temp);
        } else if (temp <= 25) {
            printf("%d - Warm\n", temp);
        } else {
            printf("%d - Hot\n", temp);
        }
        temp += 5;
    } while (temp <= 40);

    printf("\nEND OF REPORT");

    return 0;
}
