/*
@output
Name: Maria
Age: 20
Height: 165.5 cm
Grade: A
Pi (2 decimals): 3.14
Pi (4 decimals): 3.1416

@variables
age = 20
height = 165.5
grade = A
name = Maria
*/
public class TaskJuliet {
    public static void main(String[] args) {
        int age = 20;
        float height = 165.5f;
        char grade = 'A';
        String name = "Maria";

        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.printf("Height: %.1f cm%\n", height);
        System.out.println("Grade: " + grade);
        System.out.printf("Pi (2 decimals): %.2f%\n", 3.14159);
        System.out.printf("Pi (4 decimals): %.4f%\n", 3.14159);
    }
}
