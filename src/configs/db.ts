import mongoose, { ConnectOptions } from "mongoose";


const connection: any = {
  isConnected: 0,
};

export const connect_db = async () => {
  const db_options: ConnectOptions = {
    // dbName: "CallRecAi",
    // maxPoolSize: 10,
  };
  try {
    if (connection.isConnected) {
      console.log(`MongoDB Already Connected`);
    } else {
      const conn = await mongoose.connect(process.env.MONGODB_URI!, db_options);
      connection.isConnected = conn.connections[0].readyState;
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
  } catch (error: any) {
    console.log(`Error: ${error.msg}`);
    process.exit();
  }
};

