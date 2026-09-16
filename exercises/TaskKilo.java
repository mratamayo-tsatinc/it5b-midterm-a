/*
@output
Initial score: 75
Initial price: 9.50
Initial letter: B
Updated score: 90
Updated price: 12.00
Updated letter: A
Final score: 95

@variables
score = 95
price = 12.00
letter = A
bonus = 90
*/
public class TaskKilo {
    public static void main(String[] args) {
        int score;
        float price;
        char letter;

        score = 75;
        price = 9.5f;
        letter = 'B';

        System.out.println("Initial score: " + score);
        System.out.printf("Initial price: %.2f%n", price);
        System.out.println("Initial letter: " + letter);

        score = 90;
        price = price + 2.5f;
        letter = 'A';

        System.out.println("Updated score: " + score);
        System.out.printf("Updated price: %.2f%n", price);
        System.out.println("Updated letter: " + letter);

        int bonus = score;
        score = bonus + 5;

        System.out.println("Final score: " + score);
    }
}
