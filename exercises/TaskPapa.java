/*
@output
Initial value of a: 5
Initial value of b: 5
Initial value of c: 10
Initial value of d: 10

Updated value of a: 4
Updated value of b: 6
Updated value of c: 11
Updated value of d: 9

sum = ++p + q++ : 9
final p: 5
final q: 5

@variables
a = 4
b = 6
c = 11
d = 9
p = 5
q = 5
sum = 9
*/
public class TaskPapa {
    public static void main(String[] args) {
        int a = 5;
        int b = 5;
        int c = 10;
        int d = 10;

        System.out.println("Initial value of a: " + a);
        System.out.println("Initial value of b: " + b);
        System.out.println("Initial value of c: " + c);
        System.out.println("Initial value of d: " + d);
        System.out.println();

        a--;
        ++b;
        c++;
        --d;

        System.out.println("Updated value of a: " + a);
        System.out.println("Updated value of b: " + b);
        System.out.println("Updated value of c: " + c);
        System.out.println("Updated value of d: " + d);
        System.out.println();

        int p = 4;
        int q = 4;
        int sum = ++p + q++;

        System.out.println("sum = ++p + q++ : " + sum);
        System.out.println("final p: " + p);
        System.out.println("final q: " + q);
    }
}
