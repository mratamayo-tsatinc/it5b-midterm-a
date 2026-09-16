/*
@output
age = 19
hasID = true
hasTicket = false
canEnterClub: true
canWatchMovie: true
isDenied: false
complexCheck: true

@variables
canEnterClub = true
canWatchMovie = true
isDenied = false
complexCheck = true
*/
public class TaskNovember {
    public static void main(String[] args) {
        int age = 19;
        boolean hasID = true;
        boolean hasTicket = false;

        boolean canEnterClub = (age >= 18) && hasID;
        boolean canWatchMovie = (age >= 13) || hasTicket;
        boolean isDenied = !canEnterClub;
        boolean complexCheck = (age > 17 && hasID) || (hasTicket && age > 21);

        System.out.println("age = " + age);
        System.out.println("hasID = " + hasID);
        System.out.println("hasTicket = " + hasTicket);
        System.out.println("canEnterClub: " + canEnterClub);
        System.out.println("canWatchMovie: " + canWatchMovie);
        System.out.println("isDenied: " + isDenied);
        System.out.println("complexCheck: " + complexCheck);
    }
}
