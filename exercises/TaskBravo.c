/*
@output
1
2
3 - Fizz
4
5 - Buzz
6 - Fizz
7
8
9 - Fizz
10 - Buzz
11
12 - Fizz
13
14
15 - FizzBuzz
16
17
18 - Fizz
19
20 - Buzz

@variables
number = 21
*/
#include <stdio.h>

int main() {
    int number = 1;

    do {
        if (number % 3 == 0 && number % 5 == 0) {
            printf("%d - FizzBuzz\n", number);
        } else if (number % 3 == 0) {
            printf("%d - Fizz\n", number);
        } else if (number % 5 == 0) {
            printf("%d - Buzz\n", number);
        } else {
            printf("%d\n", number);
        }
        number++;
    } while (number <= 20);

    return 0;
}
