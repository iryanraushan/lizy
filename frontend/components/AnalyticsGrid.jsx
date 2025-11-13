import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import AnalyticsCard from "./AnalyticsCard";
import { theme } from "../constants/theme";
import IconComponent from "./IconComponent";

const AnalyticsGrid = ({
  title = "Analytics Overview",
  data,
  loading = false,
  cardConfigs = [],
  columnsPerRow = 2,
}) => {
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (!data || cardConfigs.length === 0) return null;

  const getCardRows = () => {
    const rows = [];
    for (let i = 0; i < cardConfigs.length; i += columnsPerRow) {
      rows.push(cardConfigs.slice(i, i + columnsPerRow));
    }
    return rows;
  };

  const cardRows = getCardRows();

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        {cardRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.cardRow}>
            {row.map((config, cardIndex) => {
              const cardData = data[config.dataKey];
              const previousData = data[config.previousDataKey];

              let trend = null;
              let trendDirection = null;
              if (
                cardData &&
                previousData &&
                typeof cardData === "number" &&
                typeof previousData === "number"
              ) {
                const change = ((cardData - previousData) / previousData) * 100;
                trend = Math.abs(change).toFixed(1) + "%";
                trendDirection =
                  change > 0 ? "up" : change < 0 ? "down" : "neutral";
              }

              return (
                <View
                  key={config.key || `${rowIndex}-${cardIndex}`}
                  style={[
                    styles.cardWrapper,
                    { width: `${100 / columnsPerRow - 2}%` },
                  ]}
                >
                  <EnhancedAnalyticsCard
                    icon={config.icon}
                    iconColor={config.iconColor || theme.colors.primary}
                    value={cardData || 0}
                    title={config.title}
                    subtitle={config.subtitle ? config.subtitle(data) : ""}
                    borderColor={config.borderColor}
                    IconComponent={config.IconComponent}
                    trend={config.showTrend !== false ? trend : null}
                    trendDirection={trendDirection}
                    prefix={config.prefix || ""}
                    suffix={config.suffix || ""}
                    formatValue={config.formatValue}
                    backgroundColor={config.backgroundColor}
                    size={config.size || "medium"}
                  />
                </View>
              );
            })}

            {row.length < columnsPerRow &&
              Array.from({ length: columnsPerRow - row.length }).map(
                (_, emptyIndex) => (
                  <View
                    key={`empty-${rowIndex}-${emptyIndex}`}
                    style={[
                      styles.cardWrapper,
                      { width: `${100 / columnsPerRow - 2}%` },
                    ]}
                  />
                )
              )}
          </View>
        ))}
      </View>
    </View>
  );
};

const EnhancedAnalyticsCard = ({
  icon,
  iconColor = theme.colors.primary,
  value,
  title,
  subtitle,
  borderColor,
  trend,
  trendDirection,
  prefix = "",
  suffix = "",
  formatValue,
  backgroundColor,
  size = "medium",
}) => {

  const formatDisplayValue = (val) => {
    if (formatValue && typeof formatValue === "function") {
      return formatValue(val);
    }

    if (typeof val === "number") {
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + "M";
      } else if (val >= 1000) {
        return (val / 1000).toFixed(1) + "K";
      }
      return val.toLocaleString();
    }

    return val;
  };

  const cardSize =
    size === "large"
      ? styles.cardLarge
      : size === "small"
      ? styles.cardSmall
      : styles.cardMedium;

  return (
    <View
      style={[
        styles.card,
        cardSize,
        backgroundColor && { backgroundColor },
        borderColor && { borderLeftWidth: 4, borderLeftColor: borderColor },
      ]}
    >
      <View style={styles.cardBody}>
        <View style={styles.cardContent}>
          <Text style={styles.cardValue}>
            {prefix}
            {formatDisplayValue(value)}
            {suffix}
          </Text>
          <Text style={styles.cardTitle}>{title}</Text>
          {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
        </View>

        <View style={styles.iconWrapper}>
          <View style={styles.iconContainer}>
            <IconComponent
              iconName={icon}
              iconFamily="Feather"
              size={20}
              color={iconColor}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing["2xl"],
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xl,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing["4xl"],
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  gridContainer: {
    paddingHorizontal: theme.spacing.xs,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    backgroundColor: theme.colors.surface || "#FFFFFF",
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border || "#E5E7EB",
  },
  cardSmall: {
    padding: theme.spacing.md,
    minHeight: 100,
  },
  cardMedium: {
    padding: theme.spacing.lg,
    minHeight: 120,
  },
  cardLarge: {
    padding: theme.spacing.xl,
    minHeight: 140,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    marginBottom: theme.spacing.xs,
    minHeight: 24,
  },
  cardBody: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
  },
  cardContent: {
    flex: 1,
    justifyContent: "flex-start",
    paddingRight: theme.spacing.lg, 
  },
  cardValue: {
    fontSize: 40,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    lineHeight: 48,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    lineHeight: theme.typography.fontSize.sm * 1.3,
  },
  cardSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    opacity: 0.7,
    lineHeight: theme.typography.fontSize.xs * 1.3,
  },
  iconWrapper: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary + "10",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.primary + "20",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full || 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  trendIcon: {
    fontSize: 12,
    marginRight: 3,
    fontWeight: "bold",
  },
  trendText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  footer: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
  },
  footerText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontStyle: "italic",
  },
});

export default AnalyticsGrid;
