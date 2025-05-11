const serverError = (res: any, err: any) => {
  console.log("Server Error :>> ", err);
  return response( res, true, 500, "something went wrong.! Please try again later", null );
};

const response = ( res: any, isError: boolean, statusCode: number, message: string, data: any ) => {
  if (!isError) {
    return res.status(statusCode).json({ message: message, data });
  }
  return res.status(statusCode).json({ message: message });
};

export { serverError, response };
