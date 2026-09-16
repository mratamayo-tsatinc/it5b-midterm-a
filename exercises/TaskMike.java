/*
@output
x = 10, y = 7
x == y : false
x != y : true
x > y  : true
x <= y : false
x == 10 : true

@variables
isEqual = false
isNotEqual = true
isGreater = true
isLessOrEqual = false
isEqualToItself = true
*/
public class TaskMike {
    public static void main(String[] args) {
        int x = 10;
        int y = 7;

        boolean isEqual = (x == y);
        boolean isNotEqual = (x != y);
        boolean isGreater = (x > y);
        boolean isLessOrEqual = (x <= y);
        boolean isEqualToItself = (x == 10);

        System.out.println("x = " + x + ", y = " + y);
        System.out.println("x == y : " + isEqual);
        System.out.println("x != y : " + isNotEqual);
        System.out.println("x > y  : " + isGreater);
        System.out.println("x <= y : " + isLessOrEqual);
        System.out.println("x == 10 : " + isEqualToItself);
    }
}
