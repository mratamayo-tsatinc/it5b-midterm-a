/*
@output
Program started.
Program ended.

@variables
n = 20
i = 1
*/
#include <stdio.h>

int main() {
    int n = 20;
    int i = 1;
    printf("Program started.\n");
    while (i > n) {
        printf("%d\n", i);
        i++;
    }
    printf("Program ended.\n");

    return 0;
}
