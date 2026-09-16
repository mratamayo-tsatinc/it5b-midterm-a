/*
@output
initial total: 20
35->27->81->20->0

initial balance: 100.00
final balance: 65.12

@variables
total = 0
balance = 65.12
*/
public class TaskQuebec {
    public static void main(String[] args) {
        int total = 20;
        System.out.println("initial total: " + total);

        total += 15;
        System.out.print(total + "->");

        total -= 8;
        System.out.print(total + "->");

        total *= 3;
        System.out.print(total + "->");

        total /= 4;
        System.out.print(total + "->");

        total %= 5;
        System.out.println(total + "\n");

        float balance = 100.0f;
        System.out.printf("initial balance: %.2f%\n", balance);

        balance += 50.5f;
        balance -= 20.25f;
        balance *= 2;
        balance /= 4;

        System.out.printf("final balance: %.2f%\n", balance);
    }
}
