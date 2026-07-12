package edu.franklin.cecas.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.extra-credit")
public record ExtraCreditProperties(int cap) {}