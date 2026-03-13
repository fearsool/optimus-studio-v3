import React from 'react';

/**
 * 😷 PATIENT ZERO
 * This file is deliberately messy to test "The Critic" and "The Surgeon".
 * Complexity Score should be very high.
 */

export function messyFunction(a: number, b: number, c: number) {
    if (a > 10) {
        if (b > 20) {
            if (c > 30) {
                console.log('Deep nesting 1');
                if (a + b > 50) {
                    console.log('Deep nesting 2');
                    return a * b * c;
                }
            } else {
                return a + b;
            }
        } else if (b < 5) {
            switch (c) {
                case 1: return 1;
                case 2: return 2;
                case 3: return 3;
                case 4: return 4;
                default: return 0;
            }
        }
    }

    // More complexity
    for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) {
            if (i % 3 === 0) {
                console.log('FizzBuzz');
            } else {
                console.log('Fizz');
            }
        } else if (i % 5 === 0) {
            console.log('Buzz');
        }
    }

    return 0;
}

export function unusedFunction() {
    const x = 10;
    const y = 20;
    // Unused variables
    return x + y;
}
