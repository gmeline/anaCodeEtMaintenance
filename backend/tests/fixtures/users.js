const validUsers = [
  {
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    age: 25,
  },
  {
    id: 2,
    name: "Bob",
    email: "bob@example.com",
    age: 30,
  },
];

const invalidUsers = [
  {
    id: 3,
    name: "",
    email: "invalidemail",
    age: -5,
  },
  {
    id: 4,
    name: "Charlie",
    email: "alice@example.com",
  },
];

const updateData = {
  id: 5,
  name: "Alice Updated",
  email: "alice.updated@example.com",
  age: 26,
};

module.exports = { validUsers, invalidUsers, updateData };
