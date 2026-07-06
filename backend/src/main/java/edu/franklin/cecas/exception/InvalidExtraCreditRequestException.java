package edu.franklin.cecas.exception;

public class InvalidExtraCreditRequestException extends RuntimeException {
    public InvalidExtraCreditRequestException(String message) {
        super(message);
    }
}