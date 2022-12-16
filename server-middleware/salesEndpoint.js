import sales from "../api/sales";
const express = require("express");

const app = express();
app.use(express.json());


app.get("/api/sales", async (req, res) => {
  let { limit, offset, search, genderFilter, sortBy, sortDesc } = req.query;
  let serverItemsLength;
  let result;
  offset = parseInt(offset);
  limit = parseInt(limit);
  search && search.toLowerCase();
  if (search && genderFilter) {
    //Search and genderfilter
    result = sales.results.filter(item => {
      const fullName = `${item.user.first_name} ${item.user.last_name}`.toLowerCase();
      if (fullName.includes(search) && item.gender === genderFilter)
        return item;
    });
    serverItemsLength = result.length;
    result = getSortedResult(result, sortBy, sortDesc, offset, limit);
    if (result.length > 10) {
      result = result.slice(offset, offset + limit);
    }
  } else if (search && !genderFilter) {
    //If searching but no filtering
    result = sales.results.filter(item => {
      const fullName = `${item.user.first_name} ${item.user.last_name}`.toLowerCase();
      if (fullName.includes(search)) return item;
    });
    serverItemsLength = result.length;
    result = getSortedResult(result, sortBy, sortDesc, offset, limit);
    if (result.length > 10) {
      result = result.slice(offset, offset + limit);
    }
  } else if (genderFilter && !search) {
    //If filtering on gender but no search
    result = sales.results.filter(item => {
      return item.gender === genderFilter;
    });
    serverItemsLength = result.length;
    result = getSortedResult(result, sortBy, sortDesc, offset, limit);
    if (result.length > 10) {
      result = result.slice(offset, offset + limit);
    }
  } else {
    //No filter, no search
    result = sales.results;
    result = getSortedResult(result, sortBy, sortDesc, offset, limit);
    serverItemsLength = result.length;
    if (result.length > 10) {
      result = result.slice(offset, offset + limit);
    }
  }
  res.json({ sales: result, serverItemsLength });
});

app.get("/api/sales/genders", async (req, res) => {
  const genders = [...new Set(sales.results.map(item => item.gender))];
  res.json({ genders });
});

app.get("/api/sales/totalRecords", async (req, res) => {
  const serverItemsLength = sales.results.length;
  res.json({ serverItemsLength });

})

function getSortedResult(result, sortBy, sortDesc, offset, limit) {
  if (sortBy && sortDesc !== "undefined") {
    const salesCopy = [...result];
    if (sortBy !== "full_name") {
      const sortedSales = salesCopy.sort(dynamicSort(sortBy, sortDesc));
      if (result > 10) result = sortedSales.slice(offset, offset + limit);
      else result = sortedSales;
    } else if (sortBy === "full_name") {
      sortBy = "user.first_name"
      const sortedSales = sortNestedProp(sortBy, salesCopy, sortDesc)
      if (result > 10) result = sortedSales.slice(offset, offset + limit);
      else result = sortedSales;
    }
    return result;
  }
  return result;
}

function dynamicSort(property, sortDesc) {
  let sortOrder;
  if (sortDesc === "true") {
    sortOrder = -1;
  } else {
    sortOrder = 1;
  }
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function(a, b) {
    var result =
      a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
    return result * sortOrder;
  };
}

function sortNestedProp(prop, arr, sortDesc) {
  prop = prop.split('.');
  var len = prop.length;

  arr.sort(function(a, b, sortOrder) {
    var i = 0;
    while (i < len) {
      a = a[prop[i]];
      b = b[prop[i]];
      i++;
    }
    if (a < b) {
      return sortDesc === 'true' ? -1 : 1;
    } else if (a > b) {
      return sortDesc === 'true'  ? 1 : -1;
    } else {
      return 0;
    }
  });
  return arr;
};

module.exports = app;
