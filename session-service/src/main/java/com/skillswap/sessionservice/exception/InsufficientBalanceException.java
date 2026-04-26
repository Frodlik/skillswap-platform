package com.skillswap.sessionservice.exception;

public class InsufficientBalanceException extends RuntimeException {
    public InsufficientBalanceException(int balance, int required) {
        super("Insufficient balance: have " + balance + ", required " + required);
    }
}
