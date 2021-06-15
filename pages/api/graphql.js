import { ApolloServer, gql, makeExecutableSchema } from 'apollo-server-micro';

require('dotenv').config();

const postgres = require('postgres');
const sql = postgres();

const typeDefs = gql`
  type Query {
    users: [User!]!
    user(username: String): User
    toDos: [ToDo!]!
    checkedToDos(checked: Boolean!): [ToDo]
  }

  type Mutation {
    createUser(name: String!, username: String!): User!
    createToDo(title: String!, checked: Boolean!): ToDo!
  }

  type User {
    name: String
    username: String
  }

  type ToDo {
    title: String!
    checked: Boolean!
  }
`;
const users = [
  { name: 'Leeroy Jenkins', username: 'leeroy' },
  { name: 'Foo Bar', username: 'foobar' },
];

async function getToDos() {
  return await sql`
  SELECT
  *
  FROM
  todos
  `;
}

async function getCheckedToDos(checked) {
  return await sql`
  SELECT
  *
  FROM
  todos
  WHERE
  checked = ${checked}
  `;
}

async function createNewToDo(title, checked) {
  const result = await sql`
  INSERT INTO
  todos (title, checked)
  VALUES
  (${title}, ${checked})
  RETURNING
  id, title, checked;
  `;
  return result[0];
}

const resolvers = {
  Query: {
    users() {
      return users;
    },
    user(parent, { username }) {
      return users.find((user) => user.username === username);
    },
    toDos() {
      return getToDos();
    },
    checkedToDos(parent, { checked }) {
      return getCheckedToDos(checked);
    },
  },
  Mutation: {
    createUser: (parent, { name, username }) => {
      const user = { name, username };
      users.push(user);
      return user;
    },
    createToDo: (parent, { title, checked }) => {
      return createNewToDo(title, checked);
    },
  },
};

export const schema = makeExecutableSchema({ typeDefs, resolvers });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default new ApolloServer({ schema }).createHandler({
  path: '/api/graphql',
});
