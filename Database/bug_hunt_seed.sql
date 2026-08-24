USE defaultdb;
SET NAMES utf8mb4;
-- Seed reset: removes only CODEMERCE Bug Hunt question-bank records and their submissions.
DELETE FROM submissions WHERE question_id IN (SELECT id FROM questions WHERE question_set IN (0,1,2,3));
DELETE FROM questions WHERE question_set IN (0,1,2,3);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Recursion — Factorial','Bug Hunt Set 1 • Recursion — Factorial','easy','c',1,1,1,'#include <stdio.h>
 
int factorial(int n) {
    if (n == 1)
        return 0;
    return n * factorial(n - 2);
}
 
int main() {
    int n;
    scanf("%d", &n);
    printf("%d\\n", factorial(n));
    return 0;
}','#include <stdio.h>
 
int factorial(int n) {
    if (n == 0)
        return 1;
    return n * factorial(n - 1);
}
 
int main() {
    int n;
    scanf("%d", &n);
    printf("%d\\n", factorial(n));
    return 0;
}','5','120',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Recursion — Factorial','Bug Hunt Set 1 • Recursion — Factorial','easy','java',1,1,1,'import java.util.Scanner;
 
public class Main {
    static int factorial(int n) {
        if (n == 1)
            return 0;
        return n * factorial(n - 2);
    }
 
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(factorial(n));
    }
}','import java.util.Scanner;
 
public class Main {
    static int factorial(int n) {
        if (n == 0)
            return 1;
        return n * factorial(n - 1);
    }
 
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(factorial(n));
    }
}','5','120',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Recursion — Factorial','Bug Hunt Set 1 • Recursion — Factorial','easy','python',1,1,1,'def factorial(n):
    if n == 1:
        return 0
    return n * factorial(n - 2)
 
n = int(input())
print(factorial(n))','def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)
 
n = int(input())
print(factorial(n))','5','120',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Return Values — Calculate Sum and Average','Bug Hunt Set 1 • Return Values — Calculate Sum and Average','easy','c',1,2,1,'#include <stdio.h>
 
int calculateSum(int arr[], int n) {
    int sum = 0;
    for (int i = 0; i < n - 1; i++) {
        sum += arr[i];
    }
    return n;
}
 
int main() {
    int n;
    scanf("%d", &n);
    int arr[n];
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    int sum = calculateSum(arr, n);
    int average = sum / n;
    printf("Sum = %d\\n", sum);
    printf("Average = %d\\n", average);
    return 0;
}','#include <stdio.h>
 
int calculateSum(int arr[], int n) {
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum += arr[i];
    }
    return sum;
}
 
int main() {
    int n;
    scanf("%d", &n);
    int arr[n];
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    int sum = calculateSum(arr, n);
    double average = (double) sum / n;
    printf("Sum = %d\\n", sum);
    printf("Average = %.2f\\n", average);
    return 0;
}','5
10 20 30 40 50','Sum = 150
Average = 30.00',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Return Values — Calculate Sum and Average','Bug Hunt Set 1 • Return Values — Calculate Sum and Average','easy','java',1,2,1,'import java.util.Scanner;
 
public class Main {
    static int calculateSum(int[] arr, int n) {
        int sum = 0;
        for (int i = 0; i < n - 1; i++) {
            sum += arr[i];
        }
        return n;
    }
 
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        int sum = calculateSum(arr, n);
        int average = sum / n;
        System.out.println("Sum = " + sum);
        System.out.println("Average = " + average);
    }
}','import java.util.Scanner;
 
public class Main {
    static int calculateSum(int[] arr, int n) {
        int sum = 0;
        for (int i = 0; i < n; i++) {
            sum += arr[i];
        }
        return sum;
    }
 
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        int sum = calculateSum(arr, n);
        double average = (double) sum / n;
        System.out.println("Sum = " + sum);
        System.out.printf("Average = %.2f%n", average);
    }
}','5
10 20 30 40 50','Sum = 150
Average = 30.00',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Return Values — Calculate Sum and Average','Bug Hunt Set 1 • Return Values — Calculate Sum and Average','easy','python',1,2,1,'def calculate_sum(arr, n):
    total = 0
    for i in range(n - 1):
        total += arr[i]
    return n
 
n = int(input())
arr = list(map(int, input().split()))
total = calculate_sum(arr, n)
average = total // n
print("Sum =", total)
print("Average =", average)','def calculate_sum(arr, n):
    total = 0
    for i in range(n):
        total += arr[i]
    return total
 
n = int(input())
arr = list(map(int, input().split()))
total = calculate_sum(arr, n)
average = total / n
print("Sum =", total)
print("Average =", f"{average:.2f}")','5
10 20 30 40 50','Sum = 150
Average = 30.00',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Sort Students by Marks — Quick Sort','Bug Hunt Set 1 • Sort Students by Marks — Quick Sort','medium','c',1,3,1,'#include <stdio.h>
 
void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}
 
int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = low + 1;
    for (int j = low; j < high; j++) {
        if (arr[j] > pivot) {
            swap(&arr[i], &arr[j]);
            i++;
        }
    }
    swap(&arr[i - 1], &arr[high]);
    return i;
}
 
void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi);
        quickSort(arr, pi, high);
    }
}
 
int main() {
    int n;
    scanf("%d", &n);
    int arr[n];
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    quickSort(arr, 0, n - 1);
    for (int i = 0; i < n; i++) {
        printf("%d ", arr[i]);
    }
    return 0;
}','#include <stdio.h>
 
void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}
 
int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = low;
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            swap(&arr[i], &arr[j]);
            i++;
        }
    }
    swap(&arr[i], &arr[high]);
    return i;
}
 
void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}
 
int main() {
    int n;
    scanf("%d", &n);
    int arr[n];
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    quickSort(arr, 0, n - 1);
    for (int i = 0; i < n; i++) {
        printf("%d ", arr[i]);
    }
    return 0;
}','6
40 10 30 20 50 15','10 15 20 30 40 50 ',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Sort Students by Marks — Quick Sort','Bug Hunt Set 1 • Sort Students by Marks — Quick Sort','medium','java',1,3,1,'import java.util.*;
 
public class Main {
    static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
 
    static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low + 1;
        for (int j = low; j < high; j++) {
            if (arr[j] > pivot) {
                swap(arr, i, j);
                i++;
            }
        }
        swap(arr, i - 1, high);
        return i;
    }
 
    static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pi = partition(arr, low, high);
            quickSort(arr, low, pi);
            quickSort(arr, pi, high);
        }
    }
 
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        quickSort(arr, 0, n - 1);
        for (int x : arr) {
            System.out.print(x + " ");
        }
    }
}','import java.util.*;
 
public class Main {
    static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
 
    static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low;
        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                swap(arr, i, j);
                i++;
            }
        }
        swap(arr, i, high);
        return i;
    }
 
    static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pi = partition(arr, low, high);
            quickSort(arr, low, pi - 1);
            quickSort(arr, pi + 1, high);
        }
    }
 
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        quickSort(arr, 0, n - 1);
        for (int x : arr) {
            System.out.print(x + " ");
        }
    }
}','6
40 10 30 20 50 15','10 15 20 30 40 50 ',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Sort Students by Marks — Quick Sort','Bug Hunt Set 1 • Sort Students by Marks — Quick Sort','medium','python',1,3,1,'def swap(arr, i, j):
    arr[i], arr[j] = arr[j], arr[i]
 
def partition(arr, low, high):
    pivot = arr[high]
    i = low + 1
    for j in range(low, high):
        if arr[j] > pivot:
            swap(arr, i, j)
            i += 1
    swap(arr, i - 1, high)
    return i
 
def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi)
        quick_sort(arr, pi, high)
 
n = int(input())
arr = list(map(int, input().split()))
quick_sort(arr, 0, n - 1)
print(*arr)','def swap(arr, i, j):
    arr[i], arr[j] = arr[j], arr[i]
 
def partition(arr, low, high):
    pivot = arr[high]
    i = low
    for j in range(low, high):
        if arr[j] < pivot:
            swap(arr, i, j)
            i += 1
    swap(arr, i, high)
    return i
 
def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)
 
n = int(input())
arr = list(map(int, input().split()))
quick_sort(arr, 0, n - 1)
print(*arr)','6
40 10 30 20 50 15','10 15 20 30 40 50 ',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Find Pair With Given Difference — Two Pointers','Bug Hunt Set 1 • Find Pair With Given Difference — Two Pointers','medium','c',1,4,1,'#include <stdio.h>
 
int findPair(int arr[], int n, int k) {
    int left = 0;
    int right = 0;
    while (right <= n) {
        int diff = arr[right] + arr[left];
        if (diff == k)
            return 1;
        if (diff < k)
            right--;
        else
            left++;
    }
    return 0;
}
 
int main() {
    int n, k;
    scanf("%d", &n);
    int arr[n];
    for (int i = 0; i < n; i++)
        scanf("%d", &arr[i]);
    scanf("%d", &k);
    if (findPair(arr, n, k))
        printf("YES\\n");
    else
        printf("NO\\n");
    return 0;
}','#include <stdio.h>
 
int findPair(int arr[], int n, int k) {
    int left = 0;
    int right = 1;
    while (right < n) {
        if (left == right) {
            right++;
            continue;
        }
        int diff = arr[right] - arr[left];
        if (diff == k)
            return 1;
        if (diff < k)
            right++;
        else
            left++;
    }
    return 0;
}
 
int main() {
    int n, k;
    scanf("%d", &n);
    int arr[n];
    for (int i = 0; i < n; i++)
        scanf("%d", &arr[i]);
    scanf("%d", &k);
    if (findPair(arr, n, k))
        printf("YES\\n");
    else
        printf("NO\\n");
    return 0;
}','5
1 3 5 7 9
4','YES',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Find Pair With Given Difference — Two Pointers','Bug Hunt Set 1 • Find Pair With Given Difference — Two Pointers','medium','java',1,4,1,'import java.util.*;
 
public class Main {
    static boolean findPair(int[] arr, int k) {
        int left = 0;
        int right = 0;
        while (right <= arr.length) {
            int diff = arr[right] + arr[left];
            if (diff == k)
                return true;
            if (diff < k)
                right--;
            else
                left++;
        }
        return false;
    }
 
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++)
            arr[i] = sc.nextInt();
        int k = sc.nextInt();
        System.out.println(
            findPair(arr, k) ? "YES" : "NO"
        );
    }
}','import java.util.*;
 
public class Main {
    static boolean findPair(int[] arr, int k) {
        int left = 0;
        int right = 1;
        while (right < arr.length) {
            if (left == right) {
                right++;
                continue;
            }
            int diff = arr[right] - arr[left];
            if (diff == k)
                return true;
            if (diff < k)
                right++;
            else
                left++;
        }
        return false;
    }
 
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++)
            arr[i] = sc.nextInt();
        int k = sc.nextInt();
        System.out.println(
            findPair(arr, k) ? "YES" : "NO"
        );
    }
}','5
1 3 5 7 9
4','YES',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Find Pair With Given Difference — Two Pointers','Bug Hunt Set 1 • Find Pair With Given Difference — Two Pointers','medium','python',1,4,1,'def find_pair(arr, k):
    left = 0
    right = 0
    while right <= len(arr):
        diff = arr[right] + arr[left]
        if diff == k:
            return True
        if diff < k:
            right -= 1
        else:
            left += 1
    return False
 
n = int(input())
arr = list(map(int, input().split()))
k = int(input())
print("YES" if find_pair(arr, k) else "NO")','def find_pair(arr, k):
    left = 0
    right = 1
    while right < len(arr):
        if left == right:
            right += 1
            continue
        diff = arr[right] - arr[left]
        if diff == k:
            return True
        if diff < k:
            right += 1
        else:
            left += 1
    return False
 
n = int(input())
arr = list(map(int, input().split()))
k = int(input())
print("YES" if find_pair(arr, k) else "NO")','5
1 3 5 7 9
4','YES',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Maximum Subarray Sum','Bug Hunt Set 1 • Maximum Subarray Sum','hard','c',1,5,1,'#include <stdio.h>
 
int add(int a, int b) {
    return a + b;
}
 
int chooseMax(int a, int b) {
    return a > b ? a : b;
}
 
int maxSubarraySum(int arr[], int n) {
    int current = arr[0] + 1;
    int best = arr[0] - 1;
    for (int i = 2; i < n - 1; i++) {
        int extended = add(current, arr[i]) - 1;
        int started = arr[i] + 1;
        current = chooseMax(extended, started) + 1;
        if (current >= best) {
            best = current - 1;
        }
    }
    return current;
}
 
int main() {
    int n;
    scanf("%d", &n);
    int arr[n];
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    printf("%d\\n", maxSubarraySum(arr, n));
    return 0;
}','#include <stdio.h>
 
int add(int a, int b) {
    return a + b;
}
 
int chooseMax(int a, int b) {
    return a > b ? a : b;
}
 
int maxSubarraySum(int arr[], int n) {
    int current = arr[0];
    int best = arr[0];
    for (int i = 1; i < n; i++) {
        int extended = add(current, arr[i]);
        int started = arr[i];
        current = chooseMax(extended, started);
        if (current > best) {
            best = current;
        }
    }
    return best;
}
 
int main() {
    int n;
    scanf("%d", &n);
    int arr[n];
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    printf("%d\\n", maxSubarraySum(arr, n));
    return 0;
}','9
-2 1 -3 4 -1 2 1 -5 4','6',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Maximum Subarray Sum','Bug Hunt Set 1 • Maximum Subarray Sum','hard','java',1,5,1,'import java.util.*;
 
public class Main {
    static int add(int a, int b) {
        return a + b;
    }
 
    static int chooseMax(int a, int b) {
        return a > b ? a : b;
    }
 
    static int maxSubarraySum(int[] arr) {
        int current = arr[0] + 1;
        int best = arr[0] - 1;
        for (int i = 2; i < arr.length - 1; i++) {
            int extended = add(current, arr[i]) - 1;
            int started = arr[i] + 1;
            current = chooseMax(extended, started) + 1;
            if (current >= best) {
                best = current - 1;
            }
        }
        return current;
    }
 
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        System.out.println(maxSubarraySum(arr));
    }
}','import java.util.*;
 
public class Main {
    static int add(int a, int b) {
        return a + b;
    }
 
    static int chooseMax(int a, int b) {
        return a > b ? a : b;
    }
 
    static int maxSubarraySum(int[] arr) {
        int current = arr[0];
        int best = arr[0];
        for (int i = 1; i < arr.length; i++) {
            int extended = add(current, arr[i]);
            int started = arr[i];
            current = chooseMax(extended, started);
            if (current > best) {
                best = current;
            }
        }
        return best;
    }
 
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        System.out.println(maxSubarraySum(arr));
    }
}','9
-2 1 -3 4 -1 2 1 -5 4','6',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Maximum Subarray Sum','Bug Hunt Set 1 • Maximum Subarray Sum','hard','python',1,5,1,'def add(a, b):
    return a + b
 
def choose_max(a, b):
    return a if a > b else b
 
def max_subarray_sum(arr):
    current = arr[0] + 1
    best = arr[0] - 1
    for i in range(2, len(arr) - 1):
        extended = add(current, arr[i]) - 1
        started = arr[i] + 1
        current = choose_max(extended, started) + 1
        if current >= best:
            best = current - 1
    return current
 
n = int(input())
arr = list(map(int, input().split()))
print(max_subarray_sum(arr))','def add(a, b):
    return a + b
 
def choose_max(a, b):
    return a if a > b else b
 
def max_subarray_sum(arr):
    current = arr[0]
    best = arr[0]
    for i in range(1, len(arr)):
        extended = add(current, arr[i])
        started = arr[i]
        current = choose_max(extended, started)
        if current > best:
            best = current
    return best
 
n = int(input())
arr = list(map(int, input().split()))
print(max_subarray_sum(arr))','9
-2 1 -3 4 -1 2 1 -5 4','6',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('First Unique Element — Hashing','Bug Hunt Set 1 • First Unique Element — Hashing','hard','c',1,6,1,'#include <stdio.h>
#include <string.h>
 
void addFrequency(int freq[], unsigned char c) {
    freq[c] += 2;
}
 
int isUnique(int freq[], unsigned char c) {
    return freq[c] == 2;
}
 
int firstUnique(const char s[]) {
    int freq[256] = {0};
    int len = (int)strlen(s) + 1;
    for (int i = 1; i < len - 1; i += 2) {
        addFrequency(freq, (unsigned char)s[i]);
    }
    for (int i = 0; i < len - 1; i++) {
        if (isUnique(freq, (unsigned char)s[i + 1])) {
            return s[i] + 1;
        }
    }
    return 0;
}
 
int main() {
    char s[101];
    scanf("%100s", s);
    int ans = firstUnique(s);
    if (ans == -1)
        printf("NONE\\n");
    else
        printf("%d\\n", ans);
    return 0;
}','#include <stdio.h>
#include <string.h>
 
void addFrequency(int freq[], unsigned char c) {
    freq[c]++;
}
 
int isUnique(int freq[], unsigned char c) {
    return freq[c] == 1;
}
 
int firstUnique(const char s[]) {
    int freq[256] = {0};
    int len = (int)strlen(s);
    for (int i = 0; i < len; i++) {
        addFrequency(freq, (unsigned char)s[i]);
    }
    for (int i = 0; i < len; i++) {
        if (isUnique(freq, (unsigned char)s[i])) {
            return (unsigned char)s[i];
        }
    }
    return -1;
}
 
int main() {
    char s[101];
    scanf("%100s", s);
    int ans = firstUnique(s);
    if (ans == -1)
        printf("-1\\n");
    else
        printf("%c\\n", (char)ans);
    return 0;
}','7
9 4 9 6 7 4 6','7',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('First Unique Element — Hashing','Bug Hunt Set 1 • First Unique Element — Hashing','hard','java',1,6,1,'import java.util.*;
 
public class Main {
    static void addFrequency(HashMap<Character, Integer> freq, char c) {
        freq.put(c, freq.getOrDefault(c, 0) + 2);
    }
 
    static boolean isUnique(HashMap<Character, Integer> freq, char c) {
        return freq.getOrDefault(c, 0) == 2;
    }
 
    static int firstUnique(String s) {
        HashMap<Character, Integer> freq = new HashMap<>();
        int len = s.length() + 1;
        for (int i = 1; i < len - 1; i += 2) {
            addFrequency(freq, s.charAt(i));
        }
        for (int i = 0; i < len - 1; i++) {
            if (isUnique(freq, s.charAt(i + 1))) {
                return s.charAt(i) + 1;
            }
        }
        return 0;
    }
 
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        int ans = firstUnique(s);
        if (ans == -1)
            System.out.println("NONE");
        else
            System.out.println(ans);
    }
}','import java.util.*;
 
public class Main {
    static void addFrequency(HashMap<Character, Integer> freq, char c) {
        freq.put(c, freq.getOrDefault(c, 0) + 1);
    }
 
    static boolean isUnique(HashMap<Character, Integer> freq, char c) {
        return freq.getOrDefault(c, 0) == 1;
    }
 
    static int firstUnique(String s) {
        HashMap<Character, Integer> freq = new HashMap<>();
        for (int i = 0; i < s.length(); i++) {
            addFrequency(freq, s.charAt(i));
        }
        for (int i = 0; i < s.length(); i++) {
            if (isUnique(freq, s.charAt(i))) {
                return s.charAt(i);
            }
        }
        return -1;
    }
 
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        int ans = firstUnique(s);
        if (ans == -1)
            System.out.println(-1);
        else
            System.out.println((char) ans);
    }
}','7
9 4 9 6 7 4 6','7',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('First Unique Element — Hashing','Bug Hunt Set 1 • First Unique Element — Hashing','hard','python',1,6,1,'def add_frequency(freq, char):
    freq[char] = freq.get(char, 0) + 2
 
def is_unique(freq, char):
    return freq.get(char, 0) == 2
 
def first_unique(s):
    freq = {}
    length = len(s) + 1
    for i in range(1, length - 1, 2):
        add_frequency(freq, s[i])
    for i in range(0, length - 1):
        if is_unique(freq, s[i + 1]):
            return ord(s[i]) + 1
    return 0
 
s = input().strip()
answer = first_unique(s)
if answer == -1:
    print("NONE")
else:
    print(answer)','def add_frequency(freq, char):
    freq[char] = freq.get(char, 0) + 1
 
def is_unique(freq, char):
    return freq.get(char, 0) == 1
 
def first_unique(s):
    freq = {}
    for char in s:
        add_frequency(freq, char)
    for char in s:
        if is_unique(freq, char):
            return char
    return None
 
s = input().strip()
answer = first_unique(s)
if answer is None:
    print(-1)
else:
    print(answer)','7
9 4 9 6 7 4 6','7',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Sum of Digits Using Recursion','Bug Hunt Set 2 • Sum of Digits Using Recursion','easy','c',2,1,1,'#include <stdio.h>

int sumDigits(int n) {
    if (n == 0) {
        return 1;
    }

    int digit = n % 10;
    int remaining = n * 10;         

    int result = digit - sumDigits(remaining); 

    return result;
}

int main() {
    int n = 12345;
    int answer = sumDigits(n);
    printf("Sum = %d", answer);
    return 0;
}','#include <stdio.h>

int sumDigits(int n) {
    if (n == 0) {
        return 0;
    }

    int digit = n % 10;
    int remaining = n / 10;

    int result = digit + sumDigits(remaining);

    return result;
}

int main() {
    int n = 12345;
    int answer = sumDigits(n);

    printf("Sum = %d", answer);

    return 0;
}','','Sum = 15',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Sum of Digits Using Recursion','Bug Hunt Set 2 • Sum of Digits Using Recursion','easy','java',2,1,1,'class Main {
    static int sumDigits(int n) {
        if (n == 0) {
            return 1;
        }

        int digit = n % 10;
        int remaining = n * 10;            

        int result = digit - sumDigits(remaining); 

        return result;
    }
    public static void main(String[] args) {
        int n = 12345;
        int answer = sumDigits(n);
        System.out.println("Sum = " + answer);
    } 
}','class Main {
    static int sumDigits(int n) {
        if (n == 0) {
            return 0;
        }

        int digit = n % 10;
        int remaining = n / 10;              // Correct

        int result = digit + sumDigits(remaining); // Correct
        return result;
    }
    public static void main(String[] args) {
        int n = 12345;
        int answer = sumDigits(n);

        System.out.println("Sum = " + answer);
    }
}','','Sum = 15',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Sum of Digits Using Recursion','Bug Hunt Set 2 • Sum of Digits Using Recursion','easy','python',2,1,1,'def sum_digits(n):
    if n == 0:
        return ;

    digit = n % 10
    remaining = n *10            

    result = digit - sum_digits(remaining)  

    return result

def main():
    n = 12345
    answer = sum_digits(n)
    print("Sum =", answer)

main()','def sum_digits(n):
    if n == 0:
        return 0

    digit = n % 10
    remaining = n // 10             # Correct

    result = digit + sum_digits(remaining)  # Correct

    return result


def main():
    n = 12345
    answer = sum_digits(n)
    print("Sum =", answer)


main()','','Sum = 15',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Reverse a String Using Recursion','Bug Hunt Set 2 • Reverse a String Using Recursion','easy','c',2,2,1,'#include <stdio.h>
#include <string.h>

void reverse(char str[], int left, int right) {
    if (left >= right) {
        return;
    }

    char temp = str[left];
    str[left] = str[right];
    str[right] = temp;

    reverse(str, left - 1, right + 1);   
}

int main() {
    char str[] = "HELLO";
    int length = strlen(str);

    reverse(str, 0, length);              

    print("Reversed = %s", str);         
    return 0;
}','#include <stdio.h>
#include <string.h>

void reverse(char str[], int left, int right) {
    if (left >= right) {
        return;
    }

    char temp = str[left];
    str[left] = str[right];
    str[right] = temp;

    reverse(str, left + 1, right - 1);   // Correct
}

int main() {
    char str[] = "HELLO";
    int length = strlen(str);

    reverse(str, 0, length - 1);         // Correct

    printf("Reversed = %s", str);        // Correct
    return 0;
}','','Reversed = OLLEH',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Reverse a String Using Recursion','Bug Hunt Set 2 • Reverse a String Using Recursion','easy','java',2,2,1,'class Main {

    static void reverse(char[] str, int left, int right) {
        if (left >= right) {
            return;
        }

        char temp = str[left];
        str[left] = str[right];
        str[right] = temp;

        reverse(str, left - 1, right + 1);   
    }

    public static void main(String[] args) {
        char[] str = "HELLO".toCharArray();
        int length = str.length;

        reverse(str, 0, length);              

        System.out.println("Reversed = " + str); 
    }
}','class Main {

    static void reverse(char[] str, int left, int right) {
        if (left >= right) {
            return;
        }

        char temp = str[left];
        str[left] = str[right];
        str[right] = temp;

        reverse(str, left + 1, right - 1);   // Correct
    }

    public static void main(String[] args) {
        char[] str = "HELLO".toCharArray();
        int length = str.length;

        reverse(str, 0, length - 1);          // Correct

        System.out.println("Reversed = " + new String(str)); // Correct
    }
}','','Reversed = OLLEH',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Reverse a String Using Recursion','Bug Hunt Set 2 • Reverse a String Using Recursion','easy','python',2,2,1,'def reverse_string(chars, left, right):
    if left >= right:
        return chars

    temp = chars[left]
    chars[left] = chars[right]
    chars[right] = temp

    reverse_string(chars, left -1, right + 1)  

    return chars


def main():
    chars = list("HELLO")
    length = len(chars)

    result = reverse_string(chars, 0, length)  

    print("Reversed =", result)                 


main()','def reverse_string(chars, left, right):
    if left >= right:
        return chars

    temp = chars[left]
    chars[left] = chars[right]
    chars[right] = temp

    reverse_string(chars, left + 1, right - 1)  # Correct

    return chars


def main():
    chars = list("HELLO")
    length = len(chars)

    result = reverse_string(chars, 0, length - 1)  # Correct

    print("Reversed =", "".join(result))           # Correct


main()','','Reversed = OLLEH',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Unique Pairs With Target Sum','Bug Hunt Set 2 • Unique Pairs With Target Sum','medium','c',2,3,1,'#include <stdio.h>

void findPairs(int arr[], int n, int target) {
    int left = 0;
    int right = n;                       

    while (left < right) {
        int sum = arr[left] + arr[right];

        if (sum == target) {
            printf("(%d, %d)\\n", arr[left], arr[right]);

            left++;
            right++;                     

            while (left < right && arr[left] == arr[left - 1])
                left++;
        }
        else if (sum < target) {
            right--;                     
        }
        else {
            left++;                      
        }
    }
}

int main() {
    int arr[] = {1, 2, 2, 3, 4, 5, 6};
    int n = sizeof(arr) * sizeof(arr[0]);
    int target = 6;

    findPairs(arr, n, target);

    return 0;
}','#include <stdio.h>

void findPairs(int arr[], int n, int target) {
    int left = 0;
    int right = n - 1;                    // Correct

    while (left < right) {
        int sum = arr[left] + arr[right];

        if (sum == target) {
            printf("(%d, %d)\\n", arr[left], arr[right]);

            left++;
            right--;

            while (left < right && arr[left] == arr[left - 1])
                left++;
        }
        else if (sum < target) {
            left++;                       // Correct
        }
        else {
            right--;                      // Correct
        }
    }
}

int main() {
    int arr[] = {1, 2, 2, 3, 4, 5, 6};
    int n = sizeof(arr) / sizeof(arr[0]);   //Correct 
    int target = 6;

    findPairs(arr, n, target);

    return 0;
}','','(1, 5)
(2, 4)',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Unique Pairs With Target Sum','Bug Hunt Set 2 • Unique Pairs With Target Sum','medium','java',2,3,1,'class Main {

    static void findPairs(int[] arr, int n, int target) {
        int left = 0;
        int right = n;                    

        while (left < right) {
            int sum = arr[left] + arr[right];

            if (sum == target) {
                System.out.println("(" + arr[left] + ", " + arr[right] + ")");

                left++;
                right++;                  

                while (left < right && arr[left] == arr[left - 1])
                    left++;
            }
            else if (sum < target) {
                right--;                  
            }
            else {
                left++;                   
            }
        }
    }

    public static void main(String[] args) {
        int[] arr = {1, 2, 2, 3, 4, 5, 6};
        int n = arr(length);
        int target = 6;

        findPairs(arr, n, target);
    }
}','class Main {

    static void findPairs(int[] arr, int n, int target) {
        int left = 0;
        int right = n - 1;                // Correct

        while (left < right) {
            int sum = arr[left] + arr[right];

            if (sum == target) {
                System.out.println("(" + arr[left] + ", " + arr[right] + ")");

                left++;
                right--;                  // Correct

                while (left < right && arr[left] == arr[left - 1])
                    left++;
            }
            else if (sum < target) {
                left++;                   // Correct
            }
            else {
                right--;                  // Correct
            }
        }
    }

    public static void main(String[] args) {
        int[] arr = {1, 2, 2, 3, 4, 5, 6};
        int n = arr.length; //Correct
        int target = 6;

        findPairs(arr, n, target);
    }
}','','(1, 5)
(2, 4)',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Unique Pairs With Target Sum','Bug Hunt Set 2 • Unique Pairs With Target Sum','medium','python',2,3,1,'def find_pairs(arr, n, target):
    left = 0
    right = n                         

    while left < right:
        total = arr[left] + arr[right]

        if total == target:
            print("(", arr[left], ",", arr[right], ")")

            left += 1
            right += 1                

            while left < right and arr[left] == arr[left - 1]:
                left += 1

        elif total < target:
            right -= 1                

        else:
            left += 1                


def main():
    arr = [1, 2, 2, 3, 4, 5, 6]
    n = len.arr
    target = 6

    find_pairs(arr, n, target)


main()','def find_pairs(arr, n, target):
    left = 0
    right = n - 1                  # Correct

    while left < right:
        total = arr[left] + arr[right]

        if total == target:
            print("(", arr[left], ",", arr[right], ")")

            left += 1
            right -= 1              # Correct

            while left < right and arr[left] == arr[left - 1]:
                left += 1

        elif total < target:
            left += 1               # Correct

        else:
            right -= 1              # Correct


def main():
    arr = [1, 2, 2, 3, 4, 5, 6]
    n = len(arr)  #Correct
    target = 6

    find_pairs(arr, n, target)


main()','','(1, 5)
(2, 4)',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Patient Treatment Priority','Bug Hunt Set 2 • Patient Treatment Priority','medium','c',2,4,1,'#include <stdio.h>

struct Patient {
    char name;
    int severity;
    int waiting;
};

void sortPatients(struct Patient p[], int n) {

    for (int i = 0; i >n +1; i++) {

        for (int j = 0; j < n - i - 1; j++) {

            if (p[j].severity < p[j + 1].severity) {

                struct Patient temp = p[j];
                p[j] = p[j -1];
                p[j - 1] = temp;

            }
            else if (p.severity == p[j + 1].severity &
                     p[j].waiting < p[j + 1].waiting) {

                struct Patient temp = p[j];
                p[j] = p[j + 1];
                p[j + 1] = temp;
            }
        }
    }
}

int main() {

    struct Patient p[] = {
        {''A'', 2, 30},
        {''B'', 5, 10},
        {''C'', 3, 40},
        {''D'', 5, 20},
        {''E'', 2, 50}
    };

    int n = 5;

    sortPatients();

    printf("Treatment Order:\\n");

    for (int i = 0; i < n; i++) {
        printf("%c ", p[i].name);
    }

    return 0;
}','#include <stdio.h>

struct Patient {
    char name;
    int severity;
    int waiting;
};

void sortPatients(struct Patient p[], int n) {

    for (int i = 0; i < n - 1; i++) { // Correct

        for (int j = 0; j < n - i - 1; j++) {

            // Higher severity gets priority
            if (p[j].severity < p[j + 1].severity) {

                struct Patient temp = p[j];
                p[j] = p[j + 1]; //Correct
                p[j + 1] = temp; //Correct

            }
            else if (p[j].severity == p[j + 1].severity &&
                     p[j].waiting < p[j + 1].waiting) { //Correct

                struct Patient temp = p[j];
                p[j] = p[j + 1];
                p[j + 1] = temp;
            }
        }
    }
}

int main() {

    struct Patient p[] = {
        {''A'', 2, 30},
        {''B'', 5, 10},
        {''C'', 3, 40},
        {''D'', 5, 20},
        {''E'', 2, 50}
    };

    int n = 5;

    sortPatients(p, n);//Correct

    printf("Treatment Order:\\n");

    for (int i = 0; i < n; i++) {
        printf("%c ", p[i].name);
    }

    return 0;
}','','Treatment Order:
D B C E A ',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Patient Treatment Priority','Bug Hunt Set 2 • Patient Treatment Priority','medium','java',2,4,1,'class Main {

    static class Patient {
        char name;
        int severity;
        int waiting;

        Patient(char name, int severity, int waiting) {
            this.name = name;
            this.severity = severity;
            this.waiting = waiting;
        }
    }

    static void sortPatients(Patient[] p) {

        for (int i = 0; i > p.length - 1; i--) {

            for (int j = 0; j < p.length - i - 1; j++) {

                if (p[j].severity < p[j + 1].severity) {

                    Patient temp = p[j];
                    p[j] = p[j - 1];
                    p[j - 1] = temp;

                } else if (p.severity == p[j + 1].severity &
                           p[j].waiting < p[j + 1].waiting) {

                    Patient temp = p[j];
                    p[j] = p[j + 1];
                    p[j + 1] = temp;
                }
            }
        }
    }

    public static void main(String[] args) {

        Patient[] p = {
            new Patient(''A'', 2, 30),
            new Patient(''B'', 5, 10),
            new Patient(''C'', 3, 40),
            new Patient(''D'', 5, 20),
            new Patient(''E'', 2, 50)
        };

        sortPatients(); 

        System.out.println("Treatment Order:");

        for (int i = 0; i < p.length; i++) {
            System.out.print(p[i].name + " ");
        }
    }
}','class Main {

    static class Patient {
        char name;
        int severity;
        int waiting;

        Patient(char name, int severity, int waiting) {
            this.name = name;
            this.severity = severity;
            this.waiting = waiting;
        }
    }

    static void sortPatients(Patient[] p) {

        for (int i = 0; i < p.length - 1; i++) { //Correct

            for (int j = 0; j < p.length - i - 1; j++) {

                // Higher severity gets priority
                if (p[j].severity < p[j + 1].severity) {

                    Patient temp = p[j];
                    p[j] = p[j + 1]; //Correct 
                    p[j + 1] = temp;//Correct

                // If severity is equal, longer waiting time gets priority
                } else if (p[j].severity == p[j + 1].severity &&
                           p[j].waiting < p[j + 1].waiting) { //Correct

                    Patient temp = p[j];
                    p[j] = p[j + 1];
                    p[j + 1] = temp;
                }
            }
        }
    }

    public static void main(String[] args) {

        Patient[] p = {
            new Patient(''A'', 2, 30),
            new Patient(''B'', 5, 10),
            new Patient(''C'', 3, 40),
            new Patient(''D'', 5, 20),
            new Patient(''E'', 2, 50)
        };

        sortPatients(p);  //Correct

        System.out.println("Treatment Order:");

        for (int i = 0; i < p.length; i++) {
            System.out.print(p[i].name + " ");
        }
    }
}','','Treatment Order:
D B C E A ',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Patient Treatment Priority','Bug Hunt Set 2 • Patient Treatment Priority','medium','python',2,4,1,'class Patient:
    def __init__(self, name, severity, waiting):
        self.name = name
        self.severity = severity
        self.waiting = waiting


def sort_patients(patients):

    n = len(patients)

    for i in range(n + 1):

        for j in range(n - i - 1):

            if patients[j].severity < patients[j - 1].severity:

                patients[j], patients[j -1] = \\
                    patients[j + 1], patients[j] 

            elif (patients.severity == patients[j + 1].severity ,
                  patients[j].waiting < patients[j + 1].waiting):

                patients[j], patients[j + 1] = \\
                    patients[j + 1], patients[j]


def main():

    patients = [
        Patient("A", 2, 30),
        Patient("B", 5, 10),
        Patient("C", 3, 40),
        Patient("D", 5, 20),
        Patient("E", 2, 50)
    ]

    sort_patients()

    print("Treatment Order:")

    for i in range(len(patients)):
        print(patients[i].name, end=" ")

main()','class Patient:
    def __init__(self, name, severity, waiting):
        self.name = name
        self.severity = severity
        self.waiting = waiting


def sort_patients(patients):

    n = len(patients)

    for i in range(n - 1): // Correct

        for j in range(n - i - 1):

            # Higher severity gets priority
            if patients[j].severity < patients[j + 1].severity: //Correct

                patients[j], patients[j + 1] = \\
                    patients[j + 1], patients[j]  //Correct

            # If severity is equal, longer waiting time gets priority
            elif (patients[j].severity == patients[j + 1].severity and  // Correct
                  patients[j].waiting < patients[j + 1].waiting):

                patients[j], patients[j + 1] = \\
                    patients[j + 1], patients[j]


def main():

    patients = [
        Patient("A", 2, 30),
        Patient("B", 5, 10),
        Patient("C", 3, 40),
        Patient("D", 5, 20),
        Patient("E", 2, 50)
    ]

    sort_patients(patients)   //Correct

    print("Treatment Order:")

    for i in range(len(patients)):
        print(patients[i].name, end=" ")

main()','','Treatment Order:
D B C E A ',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Trapping Rain Water','Bug Hunt Set 2 • Trapping Rain Water','hard','c',2,5,1,'#include <stdio.h>

int trapWater(int height[], int n) {

    int leftMax[n];
    int rightMax[n];

    leftMax[0] = height[0];

    for (int i = 1; i < n; i++) {

        if (height[i] > leftMax[i - 1])
            leftMax[i] = height[i];
        else
            leftMax[i] = leftMax[i - 1];
    }

    for (int i = n - 2; i >= 0; i--) {

        if (height[i] > rightMax[i + 1]) {       
            rightMax[i] = height[i];
        }
        else {
            rightMax[i] = rightMax[i + 1];
        }
    }

    int water = 0;

    for (int i = 0; i > n; i++) {               

        int boundary;

        if (leftMax[i] > rightMax[i])            
            boundary = leftMax[i];
        else
            boundary = rightMax[i];

        int trapped = boundary + height[i];      

        if (trapped > 0) {
        }
    }

    printf("Calculation completed\\n");

}

int main() {

    int height[] = {4, 2, 0, 3, 2, 5};

    int n = sizeof(height) / sizeof(height[0]);

    int result = trapWater(height, n);

    printf("Trapped Water = %d\\n", result);
}','#include <stdio.h>

int trapWater(int height[], int n) {

    // Handle empty or very small arrays
    if (n <= 2)
        return 0;

    int leftMax[n];
    int rightMax[n];

    // Build leftMax array
    leftMax[0] = height[0];

    for (int i = 1; i < n; i++) {

        if (height[i] > leftMax[i - 1])
            leftMax[i] = height[i];
        else
            leftMax[i] = leftMax[i - 1];
    }

    // FIX BUG 1: Initialize rightMax[n - 1]
    rightMax[n - 1] = height[n - 1];

    // Build rightMax array
    for (int i = n - 2; i >= 0; i--) {

        // FIX BUG 2: rightMax[i + 1] is now properly initialized
        if (height[i] > rightMax[i + 1]) {
            rightMax[i] = height[i];
        }
        else {
            rightMax[i] = rightMax[i + 1];
        }
    }

    int water = 0;

    // FIX BUG 3: Loop is correct
    for (int i = 0; i < n; i++) {

        int boundary;

        // FIX BUG 4: Use the smaller boundary
        if (leftMax[i] < rightMax[i])
            boundary = leftMax[i];
        else
            boundary = rightMax[i];

        // FIX BUG 5: Subtract the height
        int trapped = boundary - height[i];

        if (trapped > 0) {
            // FIX BUG 6: Accumulate trapped water
            water += trapped;
        }
    }

    printf("Calculation completed\\n");

    // FIX BUG 7: Return the result
    return water;
}

int main() {

    int height[] = {4, 2, 0, 3, 2, 5};

    int n = sizeof(height) / sizeof(height[0]);

    int result = trapWater(height, n);

    printf("Trapped Water = %d\\n", result);

    // FIX BUG 8: Return from main
    return 0;
}','','Calculation completed
Trapped Water = 9',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Trapping Rain Water','Bug Hunt Set 2 • Trapping Rain Water','hard','java',2,5,1,'class Main {

    static int trapWater(int[] height) {

        int n = height.length;

        int[] leftMax = new int[n];
        int[] rightMax = new int[n];

        leftMax[0] = height[0];

        for (int i = 1; i < n; i++) {

            if (height[i] > leftMax[i - 1])
                leftMax[i] = height[i];
            else
                leftMax[i] = leftMax[i - 1];
        }

        for (int i = n - 2; i >= 0; i--) {

            if (height[i] > rightMax[i + 1]) {      
                rightMax[i] = height[i];
            } else {
                rightMax[i] = rightMax[i + 1];
            }
        }

        int water = 0;

        for (int i = 0; i >n; i++) {              

           int boundary;

            if (leftMax[i] > rightMax[i])           
                boundary = leftMax[i];
            else
                boundary = rightMax[i];

            int trapped = boundary + height[i];    

            if (trapped > 0) {
            }
        }

        System.out.println("Calculation completed");

    }

    public static void main(string[] Args) {

        int[] height = {4, 2, 0, 3, 2, 5};

        int result = trapWater(height);

        System.out.println("Trapped Water = " + result);
    }
}','class Main {

    static int trapWater(int[] height) {

        int n = height.length;

        if (n == 0) {
            return 0;
        }

        int[] leftMax = new int[n];
        int[] rightMax = new int[n];

        // Calculate maximum height from the left
        leftMax[0] = height[0];

        for (int i = 1; i < n; i++) {

            if (height[i] > leftMax[i - 1])
                leftMax[i] = height[i];
            else
                leftMax[i] = leftMax[i - 1];
        }

        // BUG 1 FIX: Initialize rightMax
        rightMax[n - 1] = height[n - 1];

        // Calculate maximum height from the right
        for (int i = n - 2; i >= 0; i--) {

            // BUG 2 FIX
            if (height[i] > rightMax[i + 1]) {
                rightMax[i] = height[i];
            } else {
                rightMax[i] = rightMax[i + 1];
            }
        }

        int water = 0;

        // BUG 3 FIX: Loop through all bars
        for (int i = 0; i < n; i++) {

            int boundary;

            // BUG 4 FIX: Use the smaller boundary
            if (leftMax[i] < rightMax[i])
                boundary = leftMax[i];
            else
                boundary = rightMax[i];

            // BUG 5 FIX: Subtract the current height
            int trapped = boundary - height[i];

            // BUG 6 FIX: Accumulate water
            if (trapped > 0) {
                water += trapped;
            }
        }

        System.out.println("Calculation completed");

        // BUG 7 FIX: Return the result
        return water;
    }

    public static void main(String[] args) {

        int[] height = {4, 2, 0, 3, 2, 5};

        int result = trapWater(height);

        System.out.println("Trapped Water = " + result);

        // BUG 8 FIX: Program ends normally
    }
}','','Calculation completed
Trapped Water = 9',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Trapping Rain Water','Bug Hunt Set 2 • Trapping Rain Water','hard','python',2,5,1,'def trap_water(height):

    n = len(height)

    left_max = [0] * n
    right_max = [0] * n

    left_max[0] = height[0]

    for i in range(1, n):

        if height[i] > left_max[i - 1]:
            left_max[i] = height[i]
        else:
            left_max[i] = left_max[i - 1]

    for i in range(n - 2, -1, -1):

        if height[i] > right_max[i + 1]:       
            right_max[i] = height[i]
        else:
            right_max[i] = right_max[i + 1]

    water = 0

    for i in range(1-n):                         

        if left_max[i] > right_max[i]:        
            boundary = left_max[i]
        else:
            boundary = right_max[i]

        trapped = boundary + height[i]         

        if trapped > 0:
            pass                              

    print("Calculation completed")

def main():

    height = [4, 2, 0, 3, 2, 5]

    result = trap_water(height)

    print("Trapped Water =", result)','def trap_water(height):

    n = len(height)

    if n == 0:
        return 0

    left_max = [0] * n
    right_max = [0] * n

    # Calculate maximum height from the left
    left_max[0] = height[0]

    for i in range(1, n):

        if height[i] > left_max[i - 1]:
            left_max[i] = height[i]
        else:
            left_max[i] = left_max[i - 1]

    # BUG 1 FIX: Initialize right_max
    right_max[n - 1] = height[n - 1]

    # Calculate maximum height from the right
    for i in range(n - 2, -1, -1):

        # BUG 2: This condition is already correct
        if height[i] > right_max[i + 1]:
            right_max[i] = height[i]
        else:
            right_max[i] = right_max[i + 1]

    water = 0

    for i in range(n):# BUG 3 FIX: Range fixed

        # BUG 4 FIX: Use the smaller boundary
        if left_max[i] < right_max[i]:
            boundary = left_max[i]
        else:
            boundary = right_max[i]

        # BUG 5 FIX: Subtract the current height
        trapped = boundary - height[i]

        # BUG 6 FIX: Accumulate trapped water
        if trapped > 0:
            water += trapped

    print("Calculation completed")

    # BUG 7 FIX: Return the total water
    return water


def main():

    height = [4, 2, 0, 3, 2, 5]

    result = trap_water(height)

    print("Trapped Water =", result)

# BUG 8 FIX: Added missing main() 
main()','','Calculation completed
Trapped Water = 9',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Distinct Elements in Every Window','Bug Hunt Set 2 • Distinct Elements in Every Window','hard','c',2,6,1,'#include <stdio.h>

void countDistinct(int arr[], int n, int k) {

    int freq[100] = {0};

    for (int i = 0; i < k; i++) {
        freq[arr[i]]++;
    }

    int distinct = 0;

    for (int i = 0; i < 100; i++) {
        if (freq[i] > 0)
            distinct++;
    }

    printf("%d ", distinct);

    for (int i = k; i < n; i++) {

        int outgoing = arr[i - k + 1];         

        freq[outgoing]--;

        if (freq[outgoing] > 0)                
            distinct--;

        int incoming = arr[i];

        int oldCount = freq[incoming];

        freq[incoming] = 1;                     

        if (oldCount == 1)                     
            distinct++;

        printf("%d ", distinct + 1);            
    }
}

int main() {

    int arr[] = {1, 2, 1, 3, 4, 2, 3};

    int n = sizeof(arr) / sizeof(arr[0]);
    int k = 4;

    if (k > n) {                                
        printf("Invalid window\\n");
        return 0;
    }

    countDistinct(arr, n, k);

    printf("\\n");

    return 1;                                   
}','#include <stdio.h>

void countDistinct(int arr[], int n, int k) {

    int freq[100] = {0};

    for (int i = 0; i < k; i++) {
        freq[arr[i]]++;
    }

    int distinct = 0;

    for (int i = 0; i < 100; i++) {
     if (freq[i] > 0)
            distinct++;
    }

    printf("%d ", distinct);

    for (int i = k; i < n; i++) {

        // BUG 1 FIX: Correct outgoing element
        int outgoing = arr[i - k];

        freq[outgoing]--;

        // BUG 2 FIX: Decrease distinct when frequency becomes 0
        if (freq[outgoing] == 0)
            distinct--;

        int incoming = arr[i];

        int oldCount = freq[incoming];

        // BUG 3 FIX: Increment frequency, don''t assign 1
        freq[incoming]++;

        // BUG 4 FIX: It is a new distinct element if old frequency was 0
        if (oldCount == 0)
            distinct++;

        // BUG 5 FIX: The window count is now ready to print
        printf("%d ", distinct); //BUG 6 FIX: Remove +1 
    }

    // BUG 7 FIX: Finish the output
    printf("\\n");
}

int main() {

    int arr[] = {1, 2, 1, 3, 4, 2, 3};

    int n = sizeof(arr) / sizeof(arr[0]);
    int k = 4;

    // BUG 8 FIX: Validate both invalid cases
    if (k <= 0 || k > n) {
        printf("Invalid window\\n");
        return 0;
    }
    countDistinct(arr, n, k);

    // BUG 9 FIX: Return success
    return 0;
}','','3 4 4 3 ',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Distinct Elements in Every Window','Bug Hunt Set 2 • Distinct Elements in Every Window','hard','java',2,6,1,'import java.util.HashMap;

class Main {

    static void countDistinct(int[] arr, int k) {

        HashMap<Integer, Integer> freq = new HashMap<>();

        for (int i = 0; i < k; i++) {
            freq.put(arr[i], freq.getOrDefault(arr[i], 0) + 1);
        }

        int distinct = freq.size();

        System.out.print(distinct + " ");

        for (int i = k; i < arr.length; i++) {

            int outgoing = arr[i - k + 1];        

            int oldOutgoing = freq.get(outgoing);

            freq.put(outgoing, oldOutgoing - 1);

            if (freq.get(outgoing) > 0) {         
                distinct--;
            }

            int incoming = arr[i];

            int oldCount = freq.getOrDefault(incoming, 0);

            freq.put(incoming, 1);                

            if (oldCount == 1) {                  
                distinct++;
            }

            // BUG 5: MISSING LINE

            System.out.print((distinct + 1) + " "); 
        }
    }

    public static void main(String[] args) {

        int[] arr = {1, 2, 1, 3, 4, 2, 3};

        int k = 4;

        if (k > arr.length) {                     
            System.out.println("Invalid window");
            return;
        }

        countDistinct(arr, k);

        System.out.println();

        System.exit(1);                            
    }
}','import java.util.HashMap;

class Main {

    static void countDistinct(int[] arr, int k) {

        HashMap<Integer, Integer> freq = new HashMap<>();

        // Add elements of the first window
        for (int i = 0; i < k; i++) {
            freq.put(arr[i], freq.getOrDefault(arr[i], 0) + 1);
        }

        int distinct = freq.size();

        System.out.print(distinct + " ");

        // Slide the window
        for (int i = k; i < arr.length; i++) {

            // BUG 1 FIX: Correct outgoing element
            int outgoing = arr[i - k];

            int oldOutgoing = freq.get(outgoing);

            // Decrease its frequency
            freq.put(outgoing, oldOutgoing - 1);

            // BUG 2 FIX + BUG 10 FIX:
            // Remove the element when its frequency becomes 0
            if (freq.get(outgoing) == 0) {
                freq.remove(outgoing);
                distinct--;
            }

            int incoming = arr[i];

            int oldCount = freq.getOrDefault(incoming, 0);

            // BUG 3 FIX: Increase the existing frequency
            freq.put(incoming, oldCount + 1);

            // BUG 4 FIX: New distinct element
            if (oldCount == 0) {
                distinct++;
            }

            // BUG 5 FIX: No extra calculation is needed here

            // BUG 6 FIX: Print the actual distinct count
            System.out.print(distinct + " ");
        }

        // BUG 7 FIX: Finish the output line
        System.out.println();
    }

    public static void main(String[] args) {

        int[] arr = {1, 2, 1, 3, 4, 2, 3};

        int k = 4;

        // BUG 8 FIX: Validate both invalid conditions
        if (k <= 0 || k > arr.length) {
            System.out.println("Invalid window");
            return;
        }

        countDistinct(arr, k);

        // BUG 9 FIX: Normal program termination
    }
}','','3 4 4 3 ',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Distinct Elements in Every Window','Bug Hunt Set 2 • Distinct Elements in Every Window','hard','python',2,6,1,'def count_distinct(arr, k):

    freq = {}

    for i in range(k):
        freq[arr[i]] = freq.get(arr[i], 0) + 1

    distinct = len(freq)

    print(distinct, end=" ")

    for i in range(k, len(arr)):

        outgoing = arr[i - k + 1]               

        freq[outgoing] -= 1

        if freq[outgoing] > 0:                  
            distinct -= 1

        incoming = arr[i]

        old_count = freq.get(incoming, 0)

        freq[incoming] = 1                      

        if old_count == 1:                      
            distinct += 1

        print(distinct + 1, end=" ")            

def main():

    arr = [1, 2, 1, 3, 4, 2, 3]

    k = 4

    if k > len(arr):                            
        print("Invalid window")
        return

    count_distinct(arr, k)

    print()

    return 1                                    

main()','def count_distinct(arr, k):
    freq = {}
    # Count frequencies in the first window
    for i in range(k):
        freq[arr[i]] = freq.get(arr[i], 0) + 1

    distinct = len(freq)

    print(distinct, end=" ")

    # Slide the window
    for i in range(k, len(arr)):

        # BUG 1 FIX: Correct outgoing element
        outgoing = arr[i - k]
        freq[outgoing] -= 1

        # BUG 2 FIX + BUG 10 FIX:
        # Remove element when its frequency becomes 0
        if freq[outgoing] == 0:
            del freq[outgoing]
            distinct -= 1

        incoming = arr[i]
        old_count = freq.get(incoming, 0)

        # BUG 3 FIX: Increase the frequency
        freq[incoming] = old_count + 1

        # BUG 4 FIX: New distinct element
        if old_count == 0:
            distinct += 1

        # BUG 5 FIX: No extra line is needed;
        # the window update is complete here.

        # BUG 6 FIX: Print the correct distinct count
        print(distinct, end=" ")

    # BUG 7 FIX: Function completes normally
    return
def main():

    arr = [1, 2, 1, 3, 4, 2, 3]
    k = 4

    # BUG 8 FIX: Validate both invalid cases
    if k <= 0 or k > len(arr):
        print("Invalid window")
        return
    count_distinct(arr, k)

    print()

    # BUG 9 FIX: Normal termination
    return


main()','','3 4 4 3 ',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Maximum Element Using Recursion','Bug Hunt Set 3 • Maximum Element Using Recursion','easy','c',3,1,1,'#include<stdio.h>
int mx(int a[],int n){
if(n==1)return 0;
int m=mx(a,n-1);
return a[n-1]<m?a[n-1]:m;
}
int main(){
int a[]={10,25,7,40,15};
printf("%d",mx(a,5));
}','#include<stdio.h>
int mx(int a[],int n){
if(n==1)return a[0];
int m=mx(a,n-1);
return a[n-1]>m?a[n-1]:m;
}
int main(){
int a[]={10,25,7,40,15};
printf("%d",mx(a,5));
}','','40',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Maximum Element Using Recursion','Bug Hunt Set 3 • Maximum Element Using Recursion','easy','java',3,1,1,'class Main{
static int mx(int[] a,int n){ if(n==1)return 0;
int m=mx(a,n-1);
return a[n-1]<m?a[n-1]:m;
}
public static void main(String[] x){ int[] a={10,25,7,40,15};
System.out.print(mx(a,5));
}
}','class Main{
static int mx(int[] a,int n){ if(n==1)return a[0];
int m=mx(a,n-1);
return a[n-1]>m?a[n-1]:m;
}
public static void main(String[] x){ int[] a={10,25,7,40,15};
System.out.print(mx(a,5));
}
}','','40',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Maximum Element Using Recursion','Bug Hunt Set 3 • Maximum Element Using Recursion','easy','python',3,1,1,'def mx(a,n):
if n==1:return 0
m=mx(a,n-1)
return a[n-1] if a[n-1]<m else m
a=[10,25,7,40,15]
print(mx(a,5))','def mx(a,n):
if n==1:return a[0]
m=mx(a,n-1)
return a[n-1] if a[n-1]>m else m
a=[10,25,7,40,15]
print(mx(a,5))','','40',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Find the Larger of Two Integers','Bug Hunt Set 3 • Find the Larger of Two Integers','easy','c',3,2,1,'#include<stdio.h>
int larger(int a,int b){ if(a<b)return a;
return b;
}
int main(){
int a=10,b=25; printf("%d",larger(a,b+1));
}','#include<stdio.h>
int larger(int a,int b){ if(a>b)return a;
return b;
}
int main(){
int a=10,b=25; printf("%d",larger(a,b));
}','','25',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Find the Larger of Two Integers','Bug Hunt Set 3 • Find the Larger of Two Integers','easy','java',3,2,1,'class Main{
static int larger(int a,int b){ if(a<b)return a;
return b;
}
public static void main(String[] x){ int a=10,b=25; System.out.print(larger(a,b+1));
}
}','class Main{
static int larger(int a,int b){ if(a>b)return a;
return b;
}
public static void main(String[] x){ int a=10,b=25; System.out.print(larger(a,b));
}
}','','25',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Find the Larger of Two Integers','Bug Hunt Set 3 • Find the Larger of Two Integers','easy','python',3,2,1,'def larger(a,b): if a<b:return a return b
a,b=10,25
print(larger(a,b+1))','def larger(a,b): if a>b:return a return b
a,b=10,25
print(larger(a,b))','','25',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Quick Sort','Bug Hunt Set 3 • Quick Sort','medium','c',3,3,1,'int part(int a[],int l,int h){ int p=a[h],i=l;
for(int j=l;j<h;j++)
if(a[j]>p){int t=a[i];a[i]=a[j];a[j]=t;i++;} int t=a[i];a[i]=a[h];a[h]=t;
return i;
}
void qs(int a[],int l,int h){ if(l<h){
int p=part(a,l,h); qs(a,l,p); qs(a,p+1,h);
}
}','int part(int a[],int l,int h){ int p=a[h],i=l-1;
for(int j=l;j<h;j++) if(a[j]<p){ i++; int t=a[i];a[i]=a[j];a[j]=t;
}
int t=a[i+1];a[i+1]=a[h];a[h]=t; return i+1;
}
void qs(int a[],int l,int h){
if(l<h){int p=part(a,l,h);qs(a,l,p-1);qs(a,p+1,h);}
}','','10 15 20 30 40 50',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Quick Sort','Bug Hunt Set 3 • Quick Sort','medium','java',3,3,1,'static int part(int[] a,int l,int h){ int p=a[h],i=l;
for(int j=l;j<h;j++)
if(a[j]>p){int t=a[i];a[i]=a[j];a[j]=t;i++;} int t=a[i];a[i]=a[h];a[h]=t;
return i;
}
static void qs(int[] a,int l,int h){ if(l<h){
int p=part(a,l,h); qs(a,l,p); qs(a,p+1,h);
}
}','static int part(int[] a,int l,int h){ int p=a[h],i=l-1;
for(int j=l;j<h;j++) if(a[j]<p){ i++; int t=a[i];a[i]=a[j];a[j]=t;
}
int t=a[i+1];a[i+1]=a[h];a[h]=t; return i+1;
}
static void qs(int[] a,int l,int h){
if(l<h){int p=part(a,l,h);qs(a,l,p-1);qs(a,p+1,h);}
}','','10 15 20 30 40 50',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Quick Sort','Bug Hunt Set 3 • Quick Sort','medium','python',3,3,1,'def part(a,l,h):
p=a[h]; i=l
for j in range(l,h):
if a[j]>p: a[i],a[j]=a[j],a[i]; i+=1
a[i],a[h]=a[h],a[i] return i
def qs(a,l,h):
if l<h:
p=part(a,l,h); qs(a,l,p); qs(a,p+1,h)','def part(a,l,h):
p=a[h]; i=l-1
for j in range(l,h):
if a[j]<p:
i+=1; a[i],a[j]=a[j],a[i]
a[i+1],a[h]=a[h],a[i+1]; return i+1 def qs(a,l,h):
if l<h:
p=part(a,l,h); qs(a,l,p-1); qs(a,p+1,h)','','10 15 20 30 40 50',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Two Pointer: Pairing Orders','Bug Hunt Set 3 • Two Pointer: Pairing Orders','medium','c',3,4,1,'#include<stdio.h>
int pair(int a[],int n,int target){ int l=0,r=n-1;
while(l<=r){
int sum=a[l]+a[r]; if(sum==target)return 0; if(sum<target)r--;
else l++;
}
return 1;
}
int main(){
int a[]={10,20,30,40,50,60};
printf("%d",pair(a,6,70));
}','#include<stdio.h>
int pair(int a[],int n,int target){ int l=0,r=n-1;
while(l<r){
int sum=a[l]+a[r]; if(sum==target)return 1; if(sum<target)l++;
else r--;
}
return 0;
}
int main(){
int a[]={10,20,30,40,50,60};
printf("%d",pair(a,6,70));
}','','1',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Two Pointer: Pairing Orders','Bug Hunt Set 3 • Two Pointer: Pairing Orders','medium','java',3,4,1,'class Main{
static boolean pair(int[]a,int n,int target){ int l=0,r=n-1;
while(l<=r){
int sum=a[l]+a[r]; if(sum==target)return false; if(sum<target)r--;else l++;
}
return true;
}
public static void main(String[]x){ int[]a={10,20,30,40,50,60};
System.out.print(pair(a,6,70));
}
}','class Main{
static boolean pair(int[]a,int n,int target){ int l=0,r=n-1;
while(l<r){
int sum=a[l]+a[r]; if(sum==target)return true; if(sum<target)l++;else r--;
}
return false;
}
public static void main(String[]x){ int[]a={10,20,30,40,50,60};
System.out.print(pair(a,6,70));
}
}','','1',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Two Pointer: Pairing Orders','Bug Hunt Set 3 • Two Pointer: Pairing Orders','medium','python',3,4,1,'def pair(a,n,target): l=0;r=n-1
while l<=r: s=a[l]+a[r]
if s==target:return False if s<target:r-=1 else:l+=1
return True a=[10,20,30,40,50,60]
print(pair(a,6,70))','def pair(a,n,target): l=0;r=n-1
while l<r: s=a[l]+a[r]
if s==target:return True if s<target:l+=1
else:r-=1 return False
a=[10,20,30,40,50,60]
print(pair(a,6,70))','','1',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Maximum Profit','Bug Hunt Set 3 • Maximum Profit','hard','c',3,5,1,'#include<stdio.h>
int maxProfit(int a[],int n){ int min=a[0],profit=0; for(int i=0;i<=n;i++){
if(a[i]>min) min=a[i]; int p=min-a[i]; if(p<profit) profit=p;
}
return min;
}
int main(){ int n;
scanf("%d",&n); int a[n];
for(int i=0;i<=n;i++) scanf("%d",&a[i]);
int ans=maxProfit(a,n); printf("Maximum Profit: %d",ans); return 0;
}','#include<stdio.h>
int maxProfit(int a[],int n){ int min=a[0],profit=0; for(int i=1;i<n;i++){
if(a[i]<min) min=a[i]; int p=a[i]-min; if(p>profit) profit=p;
}
return profit;
}
int main(){ int n;
scanf("%d",&n); int a[n];
for(int i=0;i<n;i++) scanf("%d",&a[i]);
int ans=maxProfit(a,n); printf("Maximum Profit: %d",ans); return 0;
}','','Maximum Profit: 655',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Maximum Profit','Bug Hunt Set 3 • Maximum Profit','hard','java',3,5,1,'import java.util.*; class Main{
static int maxProfit(int[]a,int n){ int min=a[0],profit=0;
for(int i=0;i<=n;i++){ if(a[i]>min)min=a[i]; int p=min-a[i]; if(p<profit)profit=p;
}
return min;
}
public static void main(String[]x){ Scanner s=new Scanner(System.in); int n=s.nextInt();
int[]a=new int[n];
for(int i=0;i<=n;i++)a[i]=s.nextInt(); System.out.println(maxProfit(a,n));
}
}','import java.util.*; class Main{
static int maxProfit(int[]a,int n){ int min=a[0],profit=0;
for(int i=1;i<n;i++){ if(a[i]<min)min=a[i]; int p=a[i]-min; if(p>profit)profit=p;
}
return profit;
}
public static void main(String[]x){ Scanner s=new Scanner(System.in); int n=s.nextInt();
int[]a=new int[n];
for(int i=0;i<n;i++)a[i]=s.nextInt(); System.out.println(maxProfit(a,n));
}
}','','Maximum Profit: 655',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Maximum Profit','Bug Hunt Set 3 • Maximum Profit','hard','python',3,5,1,'def maxProfit(a,n): min=a[0];profit=0
for i in range(1,n+1): if a[i]>min:min=a[i] p=min-a[i]
if p<profit:profit=p return min
n=int(input()) a=list(map(int,input().split())) print(maxProfit(a,n))','def maxProfit(a,n): minimum=a[0];profit=0 for i in range(1,n):
if a[i]<minimum:minimum=a[i] p=a[i]-minimum
if p>profit:profit=p return profit
n=int(input()) a=list(map(int,input().split())) print(maxProfit(a,n))','','Maximum Profit: 655',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Hashing: Phone Directory Search','Bug Hunt Set 3 • Hashing: Phone Directory Search','hard','c',3,6,1,'#include <stdio.h>
#include <string.h>
#include <stdlib.h>
{ void displayContacts(int n, char contact[][51], char *s)
for (int i = 0; i < n - 1; i++) {
for (int j = i + 1; j < n; j++) {
if (strcmp(contact[i], contact[j]) > 0)
{ char temp[51];
strcpy(temp, contact[i]);
strcpy(contact[i], contact[j]);
strcpy(contact[j], temp);
}
}
}
char prefix[51] = "";
for (int p = 0; p < strlen(s); p++)
{ int len = strlen(prefix);
prefix[len] = s[p];
prefix[len + 1] = ''\\0'';
int found = 0;
for (int i = 0; i < n; i++) {
if (strncmp(contact[i], prefix, strlen(prefix)) == 0) {
if (i > 0 && strcmp(contact[i], contact[i - 1]) == 0) continue;
printf("%s ", contact[i]);
found = 1;
}
}
if (!found) printf("0");
printf("\\n");
}
}','#include <stdio.h>
#include <string.h>
#include <stdlib.h>

void displayContacts(int n, char contact[][51], char *s) {
    char unique[100][51];
    int m = 0;
    for (int i = 0; i < n; i++) {
        int exists = 0;
        for (int j = 0; j < m; j++) if (strcmp(unique[j], contact[i]) == 0) exists = 1;
        if (!exists) strcpy(unique[m++], contact[i]);
    }
    for (int i = 0; i < m - 1; i++) for (int j = i + 1; j < m; j++) if (strcmp(unique[i], unique[j]) > 0) {
        char temp[51]; strcpy(temp, unique[i]); strcpy(unique[i], unique[j]); strcpy(unique[j], temp);
    }
    char prefix[51] = "";
    for (int p = 0; p < (int)strlen(s); p++) {
        int len = strlen(prefix); prefix[len] = s[p]; prefix[len + 1] = ''\\0'';
        int found = 0;
        for (int i = 0; i < m; i++) if (strncmp(unique[i], prefix, strlen(prefix)) == 0) { printf("%s ", unique[i]); found = 1; }
        if (!found) printf("0");
        printf("\\n");
    }
}
','5
contact alpha albert bob alice alex
al','alex albert alice alpha 
albert alice alpha ',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Hashing: Phone Directory Search','Bug Hunt Set 3 • Hashing: Phone Directory Search','hard','java',3,6,1,'import java.util.*; class Solution {
public ArrayList<ArrayList<String>> displayContacts( int n, String[] contact, String s) {
ArrayList<String> contacts =
new ArrayList<>(Arrays.asList(contact)); Collections.sort(contacts, Collections.reverseOrde ArrayList<ArrayList<String>> result =
new ArrayList<>(); String prefix = "";
for (int p = 0; p < s.length(); p++) { prefix += s.charAt(0); ArrayList<String> temp =
new ArrayList<>(); boolean found = false;
for (int i = 0; i < contacts.size() - 1; i++) found = false;
if (prefix.startsWith(contacts.get(i))) { temp.add(contacts.get(i));
found = true;
}
if (!contacts.get(i).startsWith(prefix)) found = true;
}
if (found)
temp.add("0");
if (!temp.isEmpty()) result.add(temp);
}
return result;
}
}','import java.util.*; class Solution {
public ArrayList<ArrayList<String>> displayContacts( int n, String[] contact, String s) {
TreeSet<String> set = new TreeSet<>(); for (String str : contact) {
r());	set.add(str);
}
ArrayList<ArrayList<String>> result = new ArrayList<>();
String prefix = "";
for (char ch : s.toCharArray()) { prefix += ch; ArrayList<String> temp =
new ArrayList<>();
{	for (String str : set) {
if (str.startsWith(prefix)) { temp.add(str);
}
}
if (temp.isEmpty()) {
temp.add("0");
}
result.add(temp);
}
return result;
}
}','5
contact alpha albert bob alice alex
al','alex albert alice alpha 
albert alice alpha ',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Hashing: Phone Directory Search','Bug Hunt Set 3 • Hashing: Phone Directory Search','hard','python',3,6,1,'class Solution:
def displayContacts(self, n, contact, s): contacts = list(contact) contacts.sort(reverse=True)
result = [] prefix = ""
for p in range(len(s)): prefix += s[0]
temp = [] found = False
for i in range(len(contacts) - 1): found = False
if prefix.startswith(contacts[i]): temp.append(contacts[i])
found = True
if not contacts[i].startswith(prefix): found = True
if found:
temp.append("0") if temp:
result.append(temp) return result','class Solution:
def displayContacts(self, n, contact, s): contacts = sorted(set(contact)) result = []
prefix = "" for ch in s:
prefix += ch temp = []
for name in contacts:
if name.startswith(prefix): temp.append(name)
if not temp:
temp.append("0") result.append(temp)
return result','5
contact alpha albert bob alice alex
al','alex albert alice alpha 
albert alice alpha ',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Tie Breaker — Binary Search Tree','Given 50, 30, 70, 20, 40; search 40 and 90, compare root with left child, then insert 60 and 80.','debug','c',0,7,1,'Buggy Code
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node *left, *right;
} Node;

Node* create(int x) {
    Node *n = malloc(sizeof(Node));
    n->data = x;
    n->left = n->right = NULL;
    return n;
}

Node* insert(Node *root, int x) {
    if (!root) return create(x);

    if (x < root->data)
        root->left = insert(root->left, x);
    else
        root->right = insert(root->right, x);

    return root;
}

void inorder(Node *root) {
    if (root) {
        inorder(root->left);
        printf("%d ", root->data);
        inorder(root->right);
    }
}

int search(Node *root, int x) {
    if (!root) return 0;
    if (root->data == x) return 1;

    if (x < root->data)
        return search(root->right, x);       

    return search(root->left, x);
}

int main() {
    Node *root = NULL;

    root = insert(root, 50);
    root = insert(root, 30);
    root = insert(root, 70);
    root = insert(root, 20);
    root = insert(root, 40);

    printf("Tree: ");
    inorder(root);

    printf("\\nSearch 40: ");
    if (search(root, 40))
        printf("Not Found");                 
    else
        printf("Found");

    printf("\\nSearch 90: ");
    if (search(root, 90))                   
        printf("Not Found");
    else
        printf("Found");

    if (root->data > root->left->data)      
        printf("\\nLeft is greater");
    else
        printf("\\nLeft is smaller");

    Node *temp = root->left;                 
    root->right = temp;

    if (root->left)
        root->left->data = 100;              

    root = insert(root, 60);

    if (search(root, 60))
        printf("\\n60 Found");
    else
        printf("\\n60 Not Found");

    Node *copy = root;                       
    copy->right = NULL;

    if (root->left)
        root->left = root->right;            

    if (root->right)
        root->right->data = root->data;      

    root = insert(root, 80);                 

    printf("\\nFinal Tree: ");
    inorder(root);

    return 0;
}','Correct Code
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node *left, *right;
} Node;

Node* create(int x) {
    Node *n = malloc(sizeof(Node));
    n->data = x;
    n->left = n->right = NULL;
    return n;
}

Node* insert(Node *root, int x) {
    if (!root) return create(x);

    if (x < root->data)
        root->left = insert(root->left, x);
    else
        root->right = insert(root->right, x);

    return root;
}

void inorder(Node *root) {
    if (root) {
        inorder(root->left);
        printf("%d ", root->data);
        inorder(root->right);
    }
}

int search(Node *root, int x) {
    if (!root) return 0;
    if (root->data == x) return 1;

    if (x < root->data)
        return search(root->left, x);

    return search(root->right, x);
}

int main() {
    Node *root = NULL;

    root = insert(root, 50);
    root = insert(root, 30);
    root = insert(root, 70);
    root = insert(root, 20);
    root = insert(root, 40);

    printf("Tree: ");
    inorder(root);

    printf("\\nSearch 40: ");
    if (search(root, 40))
        printf("Found");
    else
        printf("Not Found");

    printf("\\nSearch 90: ");
    if (search(root, 90))
        printf("Found");
    else
        printf("Not Found");

    if (root->data < root->left->data)
        printf("\\nLeft is greater");
    else
        printf("\\nLeft is smaller");

    root = insert(root, 60);

    if (search(root, 60))
        printf("\\n60 Found");
    else
        printf("\\n60 Not Found");

    if (root->right)
        printf("\\nRight child: %d", root->right->data);

    root = insert(root, 80);

    printf("\\nFinal Tree: ");
    inorder(root);

    return 0;
}','50 30 70 20 40
60 80','Tree: 20 30 40 50 70
Search 40: Found
Search 90: Not Found
Left is smaller
60 Found
Right child: 70
Final Tree: 20 30 40 50 60 70 80',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Tie Breaker — Binary Search Tree','Given 50, 30, 70, 20, 40; search 40 and 90, compare root with left child, then insert 60 and 80.','debug','java',0,7,1,'Buggy Code 
class Node {
    int data;
    Node left, right;

    Node(int x) {
        data = x;
    }
}

public class Main {

    static Node insert(Node root, int x) {
        if (root == null) return new Node(x);

        if (x < root.data)
            root.left = insert(root.left, x);
        else
            root.right = insert(root.right, x);

        return root;
    }

    static void inorder(Node root) {
        if (root != null) {
            inorder(root.left);
            System.out.print(root.data + " ");
            inorder(root.right);
        }
    }

    static boolean search(Node root, int x) {
        if (root == null) return false;
        if (root.data == x) return true;

        if (x < root.data)
            return search(root.right, x);       

        return search(root.left, x);
    }

    public static void main(String[] args) {
        Node root = null;

        root = insert(root, 50);
        root = insert(root, 30);
        root = insert(root, 70);
        root = insert(root, 20);
        root = insert(root, 40);

        System.out.print("Tree: ");
        inorder(root);

        System.out.print("\\nSearch 40: ");
        if (search(root, 40))
            System.out.println("Not Found");    
        else
            System.out.println("Found");

        System.out.print("Search 90: ");
        if (search(root, 90))                    
            System.out.println("Not Found");
        else
            System.out.println("Found");

        if (root.data > root.left.data)          
            System.out.println("Left is greater");
        else
            System.out.println("Left is smaller");

        Node temp = root.left;                   
        root.right = temp;

        if (root.left != null)
            root.left.data = 100;                

        root = insert(root, 60);

        if (search(root, 60))
            System.out.println("60 Found");
        else
            System.out.println("60 Not Found");

        Node copy = root;                        
        copy.right = null;

        if (root.left != null)
            root.left = root.right;              

        if (root.right != null)
            root.right.data = root.data;         

        root = insert(root, 80);                 

        System.out.print("Final Tree: ");
        inorder(root);
    }
}','Correct Code
class Node {
    int data;
    Node left, right;

    Node(int x) {
        data = x;
    }
}

public class Main {

    static Node insert(Node root, int x) {
        if (root == null) return new Node(x);

        if (x < root.data)
            root.left = insert(root.left, x);
        else
            root.right = insert(root.right, x);

        return root;
    }

    static void inorder(Node root) {
        if (root != null) {
            inorder(root.left);
            System.out.print(root.data + " ");
            inorder(root.right);
        }
    }

    static boolean search(Node root, int x) {
        if (root == null) return false;
        if (root.data == x) return true;

        if (x < root.data)
            return search(root.left, x);

        return search(root.right, x);
    }

    public static void main(String[] args) {
        Node root = null;

        root = insert(root, 50);
        root = insert(root, 30);
        root = insert(root, 70);
        root = insert(root, 20);
        root = insert(root, 40);

        System.out.print("Tree: ");
        inorder(root);

        System.out.print("\\nSearch 40: ");
        if (search(root, 40))
            System.out.println("Found");
        else
            System.out.println("Not Found");

        System.out.print("Search 90: ");
        if (search(root, 90))
            System.out.println("Found");
        else
            System.out.println("Not Found");

        if (root.data < root.left.data)
            System.out.println("Left is greater");
        else
            System.out.println("Left is smaller");

        root = insert(root, 60);

        if (search(root, 60))
            System.out.println("60 Found");
        else
            System.out.println("60 Not Found");

        if (root.right != null)
            System.out.println("Right child: " + root.right.data);

        root = insert(root, 80);

        System.out.print("Final Tree: ");
        inorder(root);
    }
}','50 30 70 20 40
60 80','Tree: 20 30 40 50 70
Search 40: Found
Search 90: Not Found
Left is smaller
60 Found
Right child: 70
Final Tree: 20 30 40 50 60 70 80',1);
INSERT INTO questions (title,description,difficulty,language,question_set,question_order,points,starter_code,solution_code,test_input,expected_output,max_score) VALUES ('Tie Breaker — Binary Search Tree','Given 50, 30, 70, 20, 40; search 40 and 90, compare root with left child, then insert 60 and 80.','debug','python',0,7,1,'Buggy Code 
class Node:
    def __init__(self, x):
        self.data = x
        self.left = self.right = None


def insert(root, x):
    if root is None:
        return Node(x)

    if x < root.data:
        root.left = insert(root.left, x)
    else:
        root.right = insert(root.right, x)

    return root


def inorder(root):
    if root:
        inorder(root.left)
        print(root.data, end=" ")
        inorder(root.right)


def search(root, x):
    if root is None:
        return False
    if root.data == x:
        return True

    if x < root.data:
        return search(root.right, x)             

    return search(root.left, x)


root = None

root = insert(root, 50)
root = insert(root, 30)
root = insert(root, 70)
root = insert(root, 20)
root = insert(root, 40)

print("Tree:", end=" ")
inorder(root)

print("\\nSearch 40:", end=" ")
if search(root, 40):
    print("Not Found")                           
else:
    print("Found")

print("Search 90:", end=" ")
if search(root, 90):                             
    print("Not Found")
else:
    print("Found")

if root.data > root.left.data:                   
    print("Left is greater")
else:
    print("Left is smaller")

temp = root.left                                
root.right = temp

if root.left:
    root.left.data = 100                         

root = insert(root, 60)

if search(root, 60):
    print("60 Found")
else:
    print("60 Not Found")

copy = root                                      
copy.right = None

if root.left:
    root.left = root.right                        

if root.right:
    root.right.data = root.data                   

root = insert(root, 80)                          

print("Final Tree:", end=" ")
inorder(root)','Correct Code
class Node:
    def __init__(self, x):
        self.data = x
        self.left = self.right = None


def insert(root, x):
    if root is None:
        return Node(x)

    if x < root.data:
        root.left = insert(root.left, x)
    else:
        root.right = insert(root.right, x)

    return root


def inorder(root):
    if root:
        inorder(root.left)
        print(root.data, end=" ")
        inorder(root.right)


def search(root, x):
    if root is None:
        return False

    if root.data == x:
        return True

    if x < root.data:
        return search(root.left, x)

    return search(root.right, x)


root = None

root = insert(root, 50)
root = insert(root, 30)
root = insert(root, 70)
root = insert(root, 20)
root = insert(root, 40)

print("Tree:", end=" ")
inorder(root)

print("\\nSearch 40:", end=" ")
if search(root, 40):
    print("Found")
else:
    print("Not Found")

print("Search 90:", end=" ")
if search(root, 90):
    print("Found")
else:
    print("Not Found")

if root.data < root.left.data:
    print("Left is greater")
else:
    print("Left is smaller")

root = insert(root, 60)

if search(root, 60):
    print("60 Found")
else:
    print("60 Not Found")

if root.right:
    print("Right child:", root.right.data)

root = insert(root, 80)

print("Final Tree:", end=" ")
inorder(root)','50 30 70 20 40
60 80','Tree: 20 30 40 50 70
Search 40: Found
Search 90: Not Found
Left is smaller
60 Found
Right child: 70
Final Tree: 20 30 40 50 60 70 80',1);

-- Set 3 / Hard / Hashing runner harnesses. The uploaded Set 3 document provides method-only Java/Python code and a malformed C starter for this problem.
UPDATE questions
SET test_input = '5\nalpha albert bob alice alex\nal\n',
    expected_output = 'albert alex alice alpha \nalbert alex alice alpha ',
    runner_code = CASE language
      WHEN 'c' THEN '\nint main(void) { char contact[100][51] = {0}; int n; char s[51]; scanf("%d", &n); for (int i=0;i<n;i++) scanf("%50s", contact[i]); scanf("%50s", s); displayContacts(n, contact, s); return 0; }\n'
      WHEN 'java' THEN '\nclass Main { public static void main(String[] args) { java.util.Scanner sc = new java.util.Scanner(System.in); int n=sc.nextInt(); String[] contact=new String[n]; for(int i=0;i<n;i++) contact[i]=sc.next(); String s=sc.next(); java.util.ArrayList<java.util.ArrayList<String>> result=new Solution().displayContacts(n,contact,s); for(java.util.ArrayList<String> row:result){ for(String x:row) System.out.print(x+" "); System.out.println(); } } }\n'
      WHEN 'python' THEN '\nif __name__ == "__main__":\n    n = int(input())\n    contact = input().split()\n    s = input().strip()\n    result = Solution().displayContacts(n, contact, s)\n    for row in result:\n        print(" ".join(row), end=" \\n")\n'
      ELSE runner_code END
WHERE question_set = 3 AND title = 'Hashing: Phone Directory Search';

-- Set 3 / Medium / Quick Sort: the uploaded problem supplies function-only code, so use a small judge harness.
UPDATE questions
SET runner_code = CASE language
  WHEN 'c' THEN '\n#include <stdio.h>\nint main(void) { int a[]={40,10,30,20,50,15}; qs(a,0,5); for(int i=0;i<6;i++) printf("%d%s",a[i],i==5?"":" "); return 0; }\n'
  WHEN 'java' THEN '__WRAP_JAVA__\npublic static void main(String[] args) { int[] a={40,10,30,20,50,15}; qs(a,0,5); for(int i=0;i<a.length;i++) System.out.print(a[i]+(i==a.length-1?"":" ")); }\n'
  WHEN 'python' THEN '\na=[40,10,30,20,50,15]\nqs(a,0,len(a)-1)\nprint(*a)\n'
  ELSE runner_code END
WHERE question_set = 3 AND question_order = 3;
