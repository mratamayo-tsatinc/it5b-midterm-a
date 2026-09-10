/*
@output
Printing numbers from 10 to 1...
--END--

@variables
i = 10
*/
#include <stdio.h>

int main() {
    int i = 10;

    printf("Printing numbers from 10 to 1...\n");

    while (i < 1) {
        printf("%d\n", i);
        i--;
    }

    printf("--END--\n");

    return 0;
}
