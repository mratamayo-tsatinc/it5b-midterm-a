/*
@output
Printing numbers from 1 to 10...
1
Done...

@variables
i = 2
*/
#include <stdio.h>

int main() {
    int i = 1;

    printf("Printing numbers from 1 to 10...\n");

    do {
        printf("%d\n", i);
        i++;
    } while (i > 10);

    printf("Done...\n");

    return 0;
}
