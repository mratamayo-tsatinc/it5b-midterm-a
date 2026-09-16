/*
@output
Welcome to Tech Haven!

@variables
isLoyalMember = true
qualifiesForDiscount = true
subtotal = 2400.00
discount = 240.00
taxedAmount = 172.8000
finalTotal = 2332.80
MEMBER_DISCOUNT_YEARS = 2
*/
public class TaskOscar {
    static final double TAX_RATE = 0.08;
    static final String SHOP_NAME = "Tech Haven";

    public static void main(String[] args) {
        final int MEMBER_DISCOUNT_YEARS = 2;

        String customerName = "Diego";
        int yearsAsMember = 3;
        float itemPrice = 1200.0f;
        int quantity = 2;

        System.out.println("Welcome to " + SHOP_NAME + "!");

        boolean isLoyalMember = (yearsAsMember >= MEMBER_DISCOUNT_YEARS);
        float subtotal = itemPrice * quantity;
        boolean qualifiesForDiscount = isLoyalMember && (subtotal > 1000);
        float discount = subtotal * 0.10f * (qualifiesForDiscount ? 1 : 0);
        float taxedAmount = (float) ((subtotal - discount) * TAX_RATE);
        float finalTotal = subtotal - discount + taxedAmount;
    }
}
