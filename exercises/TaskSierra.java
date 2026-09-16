/*
@output
Welcome to Tech Haven!
Customer: "Diego"
Quantity: 2
Subtotal: 2400.00
Is loyal member: 1
Discount: 240.00
Tax: 172.8000
Final Total: 2332.80
Have a great day, Diego!

@variables
isLoyalMember = 1
qualifiesForDiscount = 1
subtotal = 2400.00
discount = 240.00
taxedAmount = 172.8000
finalTotal = 2332.80
MEMBER_DISCOUNT_YEARS = 2
*/
public class TaskSierra {
    static final double TAX_RATE = 0.08;
    static final String SHOP_NAME = "Tech Haven";

    public static void main(String[] args) {
        final int MEMBER_DISCOUNT_YEARS = 2;

        String customerName = "Diego";
        int yearsAsMember = 3;
        float itemPrice = 1200.0f;
        int quantity = 2;

        System.out.println("Welcome to " + SHOP_NAME + "!");
        System.out.println("Customer: \"" + customerName + "\"");

        boolean isLoyalMember = (yearsAsMember >= MEMBER_DISCOUNT_YEARS);
        float subtotal = itemPrice * quantity;
        boolean qualifiesForDiscount = isLoyalMember && (subtotal > 1000);
        float discount = subtotal * 0.10f * (qualifiesForDiscount ? 1 : 0);
        float taxedAmount = (float) ((subtotal - discount) * TAX_RATE);
        float finalTotal = subtotal - discount + taxedAmount;

        System.out.println("Quantity: " + quantity);
        System.out.printf("Subtotal: %.2f%\n", subtotal);
        System.out.println("Is loyal member: " + (isLoyalMember ? 1 : 0));
        System.out.printf("Discount: %.2f%\n", discount);
        System.out.printf("Tax: %.4f%\n", taxedAmount);
        System.out.printf("Final Total: %.2f%\n", finalTotal);
        System.out.println("Have a great day, " + customerName + "!");
    }
}
