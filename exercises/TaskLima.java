/*
@output
a = 15, b = 4
Sum: 19
Difference: 11
Product: 60
Integer Quotient: 3
Remainder: 3
Float Quotient: 3.75

@variables
sum = 19
diff = 11
product = 60
quotient = 3
remainder = 3
floatQuotient = 3.75
*/
public class TaskLima {
    public static void main(String[] args) {
        int a = 15;
        int b = 4;

        int sum = a + b;
        int diff = a - b;
        int product = a * b;
        int quotient = a / b;
        int remainder = a % b;

        float x = 15.0f;
        float y = 4.0f;
        float floatQuotient = x / y;

        System.out.println("a = " + a + ", b = " + b);
        System.out.println("Sum: " + sum);
        System.out.println("Difference: " + diff);
        System.out.println("Product: " + product);
        System.out.println("Integer Quotient: " + quotient);
        System.out.println("Remainder: " + remainder);
        System.out.printf("Float Quotient: %.2f%", floatQuotient);
    }
}
