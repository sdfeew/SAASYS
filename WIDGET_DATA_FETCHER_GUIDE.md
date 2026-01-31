# Widget Data Fetcher Service

## Overview

The `widgetDataFetcher` service is the backbone of the Advanced Dashboard Builder. It handles fetching, filtering, grouping, aggregating, and formatting data for dashboard widgets.

## Core Functions

### 1. `fetchWidgetData(widget, tenantId, filters = {})`

Main entry point for fetching data for a widget.

**Parameters:**
- `widget` (Object): Widget configuration object
  - `dataSource.moduleId`: ID of the source module
  - `dataSource.filters`: Array of filter objects
  - `dataSource.groupBy`: Field to group by
  - `dataSource.orderBy`: Sort configuration
  - `dataSource.limit`: Maximum records to return
  - `metrics`: Array of metric configurations
  - `xAxisField`: Field for X-axis (charts)

- `tenantId` (String): Tenant ID for multi-tenant isolation
- `filters` (Object): Dashboard-level filter overrides

**Returns:**
- Array of formatted data objects

**Example:**
```javascript
const data = await widgetDataFetcher.fetchWidgetData(
  {
    dataSource: {
      moduleId: 'sales',
      groupBy: 'region',
      limit: 100
    },
    metrics: [
      { field: 'amount', aggregation: 'sum', label: 'Total Sales' }
    ],
    xAxisField: 'region'
  },
  tenantId,
  {} // no dashboard filters
);
```

### 2. `applyFilters(data, filters)`

Filters an array based on filter conditions.

**Supported Operators:**
- `equals` - Exact match
- `notEquals` - Not equal
- `contains` - Substring match
- `notContains` - Doesn't contain substring
- `greaterThan` - Numeric greater than
- `lessThan` - Numeric less than
- `greaterThanOrEqual` - Greater or equal
- `lessThanOrEqual` - Less or equal
- `in` - Value in array
- `notIn` - Value not in array
- `isEmpty` - Null/empty check
- `isNotEmpty` - Non-empty check
- `startsWith` - String prefix
- `endsWith` - String suffix

**Example:**
```javascript
const filtered = widgetDataFetcher.applyFilters(
  records,
  [
    { field: 'status', operator: 'equals', value: 'active' },
    { field: 'amount', operator: 'greaterThan', value: 1000 }
  ]
);
```

### 3. `groupAndAggregate(data, widget)`

Groups records by a field and applies aggregation functions to metrics.

**Aggregation Functions:**
- `sum` - Total of numeric values
- `avg` / `average` - Mean value
- `min` - Minimum value
- `max` - Maximum value
- `count` - Record count
- `distinctCount` - Unique values

**Example:**
```javascript
const grouped = widgetDataFetcher.groupAndAggregate(
  records,
  {
    dataSource: { groupBy: 'region' },
    metrics: [
      { field: 'amount', aggregation: 'sum' },
      { field: 'quantity', aggregation: 'avg' }
    ]
  }
);
// Result: [
//   { region: 'North', amount: 50000, quantity: 125 },
//   { region: 'South', amount: 45000, quantity: 110 }
// ]
```

### 4. `sortData(data, orderBy)`

Sorts data by specified field and direction.

**Parameters:**
- `data`: Array to sort
- `orderBy`: Object with:
  - `field`: Field name to sort by
  - `direction`: 'asc' or 'desc'

**Example:**
```javascript
const sorted = widgetDataFetcher.sortData(
  records,
  { field: 'date', direction: 'desc' }
);
```

### 5. `getNestedValue(obj, path)`

Safely retrieves nested object properties using dot notation.

**Example:**
```javascript
const value = widgetDataFetcher.getNestedValue(
  { user: { name: 'John' } },
  'user.name'
); // Returns: 'John'
```

### 6. `formatForWidget(data, widget)`

Transforms raw data into format needed for specific widget type.

**Supported Formats:**
- `chart` (bar, line, area) - Chart-ready format
- `pie` - Pie chart format
- `table` - Table grid format
- `metric` / `gauge` - KPI format
- `scatter` - Scatter plot format

**Example:**
```javascript
const chartData = widgetDataFetcher.formatForWidget(
  records,
  { type: 'bar', xAxisField: 'date' }
);
```

### 7. `getModuleFields(moduleId, tenantId)`

Retrieves available fields from a module for configuration UI.

**Returns:**
- Array of field objects with:
  - `name`: Field name
  - `type`: Data type

**Example:**
```javascript
const fields = await widgetDataFetcher.getModuleFields('sales', tenantId);
// Result: [
//   { name: 'id', type: 'string' },
//   { name: 'date', type: 'object' },
//   { name: 'amount', type: 'number' }
// ]
```

## Widget Configuration Schema

### Data Source Configuration

```javascript
{
  dataSource: {
    moduleId: String,              // ID of data source module
    filters: [                      // Module-level filters
      {
        field: String,
        operator: String,
        value: any
      }
    ],
    groupBy: String,               // Field to group by
    orderBy: {                      // Sort order
      field: String,
      direction: 'asc' | 'desc'
    },
    limit: Number                  // Max records (10-10000)
  },
  
  metrics: [                        // For aggregation
    {
      field: String,               // Field to aggregate
      aggregation: String,         // sum, avg, min, max, count, distinctCount
      label: String                // Display label
    }
  ],
  
  // Chart-specific
  xAxisField: String,              // X-axis for charts
  yAxisField: String,              // Y-axis for scatter
  
  // Pie chart specific
  labelField: String,              // Category field
  valueField: String,              // Value field
  
  // Metric/Gauge specific
  metricField: String,             // Numeric field
  format: String,                  // 'number' | 'currency' | 'percent'
  max: Number,                     // Gauge max value
  
  // Table specific
  rowsPerPage: Number,             // Pagination
  columns: Array                   // Column selection
}
```

## Data Flow Diagram

```
recordService.getAll()
         ↓
applyFilters() [dashboard + module filters]
         ↓
groupAndAggregate() [if groupBy configured]
         ↓
sortData() [apply orderBy]
         ↓
limit results [apply limit]
         ↓
formatForWidget() [format for widget type]
         ↓
widget receives ready-to-render data
```

## Usage in Components

### In DashboardCanvas Component

```javascript
import { widgetDataFetcher } from '../services/widgetDataFetcher';

useEffect(() => {
  const fetchAllWidgetData = async () => {
    for (const widget of widgets) {
      const data = await widgetDataFetcher.fetchWidgetData(
        widget,
        user.tenantId,
        dashboardFilters
      );
      
      const formatted = widgetDataFetcher.formatForWidget(data, widget);
      // Pass to widget component
    }
  };
  
  fetchAllWidgetData();
}, [widgets, dashboardFilters]);
```

### In Widget Components

```javascript
const BarChartWidget = ({ widget, data, loading, error }) => {
  // data is already fetched and formatted
  // ready to pass to Recharts BarChart
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        {/* ... chart configuration ... */}
      </BarChart>
    </ResponsiveContainer>
  );
};
```

## Performance Considerations

### Optimization Strategies

1. **Set Reasonable Limits**
   ```javascript
   dataSource: { limit: 500 } // Don't fetch 100k records
   ```

2. **Use Module-Level Filters**
   ```javascript
   dataSource: {
     filters: [
       { field: 'status', operator: 'equals', value: 'active' }
     ]
   }
   ```

3. **Group by Indexed Fields**
   - Faster grouping on indexed columns

4. **Increase Refresh Intervals**
   ```javascript
   refreshInterval: 300 // Seconds between updates
   ```

5. **Pagination for Tables**
   ```javascript
   rowsPerPage: 50 // Don't render 1000 rows
   ```

### Data Caching

Future optimization opportunity to add:
- In-memory cache of fetched data
- Cache invalidation on time interval
- Stale-while-revalidate pattern

## Error Handling

All functions include try-catch with console logging:

```javascript
try {
  const data = await widgetDataFetcher.fetchWidgetData(...);
} catch (error) {
  console.error('Error fetching widget data:', error);
  return []; // Return empty array on error
}
```

Widget components receive error state and display user-friendly messages.

## Extension Points

### Adding New Aggregation Functions

Edit `groupAndAggregate()`:
```javascript
case 'median':
  // Calculate median
  result[metric.field] = calculateMedian(values);
  break;
```

### Adding New Filter Operators

Edit `applyFilters()`:
```javascript
case 'between':
  return fieldValue >= filter.value[0] && fieldValue <= filter.value[1];
```

### Adding New Format Functions

Edit `formatForWidget()`:
```javascript
case 'heatmap':
  return this.formatForHeatmap(data, widget);
```

## Testing

### Unit Test Examples

```javascript
// Test filtering
const result = widgetDataFetcher.applyFilters(
  [{ status: 'active' }, { status: 'inactive' }],
  [{ field: 'status', operator: 'equals', value: 'active' }]
);
expect(result.length).toBe(1);

// Test aggregation
const grouped = widgetDataFetcher.groupAndAggregate(
  [{ region: 'A', sales: 100 }, { region: 'A', sales: 50 }],
  { 
    dataSource: { groupBy: 'region' },
    metrics: [{ field: 'sales', aggregation: 'sum' }]
  }
);
expect(grouped[0].sales).toBe(150);
```

## API Reference

### All Available Functions

```javascript
widgetDataFetcher.fetchWidgetData(widget, tenantId, filters)
widgetDataFetcher.applyFilters(data, filters)
widgetDataFetcher.groupAndAggregate(data, widget)
widgetDataFetcher.sortData(data, orderBy)
widgetDataFetcher.getNestedValue(obj, path)
widgetDataFetcher.formatForWidget(data, widget)
widgetDataFetcher.formatForChart(data, widget)
widgetDataFetcher.formatForPie(data, widget)
widgetDataFetcher.formatForTable(data, widget)
widgetDataFetcher.formatForMetric(data, widget)
widgetDataFetcher.formatForScatter(data, widget)
widgetDataFetcher.getModuleFields(moduleId, tenantId)
```

---

**Version:** 1.0  
**Status:** Production Ready  
**Last Updated:** 2025-01-28
