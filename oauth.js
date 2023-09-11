var { google } = require("googleapis");

let accessToken = "";
// Define the required scopes.
var scopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/firebase.database",
];

// Authenticate a JWT client with the service account.
var jwtClient = new google.auth.JWT(
  "firebase-adminsdk-lbjn2@ttwarrior-e8969.iam.gserviceaccount.com",
  null,
  "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCt2b3DjAeNxUXD\nrWlATb6OoI5ohsz96DrjRzBFtSn1gyWBvEnHzQsW+rOPCuLGjBLpSZ3/aOyCT7ar\nhCeAUc3lj6GC935ZT85Jh8IqpDZ996jrXKNaXfUudG7INtw4Y/uCWj07oMjDcNo3\nSKTsRJ8UbY92YUvSHs8sbAS0HWDW1ZkC4KJ9i3+oCG0QDN0M4xxuYledgn1fqzGi\nMsmj2/YHw+H+5J5uYplqszrzCEOzyNv2hJgbiEXEH0mZi0hS3onJpFsGsBkEyfxn\nD4WB7J07a5mTyTUM7lASh6uO9hi5uP03LF99mqOsNp2PAA0KrlBRqTPnGdIo5FUx\nxRcROor7AgMBAAECggEAJLRGdL0hMSTXtFbt1EY1t64dMuNW7zpzCF4UynrTt4Jv\nTkM+/oCDWWAnvckKFOoo6fkBcxWnbWHACtk1b8mVo2ReMKTpF5kaT/rqGw+dc53w\nm3RtBpy0sZCifQHcH8m4JY7Aw9CP4nd2ktpy+3EHdwwkkFU9aUjY66OIoLBdLC4G\nbrGKmfpiM9oXi1XkfjvMQzjqvq4YotICXUeaPD1ujVMT698cYstFrcoYJnwI7DSA\nNhzhxG03jCCQbNYYcagI4JOaGRdYLOcJPlvdPt79kEl5TqWSm6e6pr4LAnkHbc2k\nG3ETGYQ4TPKldAnRQvzRuogBQQv55vM0o4sc++K68QKBgQDWgcUpxED0zVyfMPD3\nCFxLag3dT6RN5qFCxT3pEbpYJIfuYk31QpPajg3ekdet7V8Gj736g/D7RoCeQhc9\ngN7Fop/VSkEmn2D0bt062rkmr1oxlchFhDoYqmi8uPpnt+NrdJ8bkwex7bijuZqa\nTR0BqfDyANdXtVcrrxytcqdlawKBgQDPerJpt+57wJsbtbscDMEpdIDFijblSpsa\nmvFaNFoWitSKYjlZ/pYX9MRocPykm+qNVbvlYfRfu8++jF421zUuJah9xHk13hpQ\nBHYNb4P5jZy5EvWLCY2uR/+FgUDmMZOq674gtKnCqcfDS8/dbOhV7dsQMYVMaTm1\nS8lAs+dEsQKBgBArP/1h+bN6N10Yh1FXo/1bRShFdJEarVUnIP+MgotaVZS2fEHc\nfuCejJUWUTefCOaptxxHDccjDVbgjHfqWuBy3bFqI3cR1HEYWjyxd/tehGHwdGQp\nD2gEkFiJaPagedgDtmqRrqbO0Hgm6WxwG5ugf7T+Mz09QhDc5kB8v/l5AoGBAJCo\n3ch0I+VI71ysot71zaAXyMjyiz/neqlcKrdYFQ/ukC5EOfSTWxcs49xmGuCyjSEq\nC63tVDODgV88A1x9RGj+fLHj0RdL2lC8K4tGm1/d6s3neCgO6yf+rxvoeNWG74yW\nfaPUEyDUu6FhNHcQPhXbl4d835HdNA1B3/oq9S6hAoGBAMF8Zh94+iXWqAff5/QB\n1XC975AA7RIxdiN3lBf/Sbbp6iJDIRBrz54jEV8rUzXP0R7Z58RjcpKVumjaljew\nrWYuUPF+N84C3fLS5VnX4nvV63zH7xfNw9gGLnsEArGOOV1zhLTvsF8IN1jVNb2v\n1u6FWxgnChDURGlF9Agzvrs6\n-----END PRIVATE KEY-----\n",
  scopes
);

// Use the JWT client to generate an access token.
jwtClient.authorize(function (error, tokens) {
  if (error) {
    console.log("Error making request to generate access token:", error);
  } else if (tokens.access_token === null) {
    console.log(
      "Provided service account does not have permission to generate access tokens"
    );
  } else {
    accessToken = tokens.access_token;
    console.log("hi");
    console.log("token:", accessToken);

    // See the "Using the access token" section below for information
    // on how to use the access token to send authenticated requests to
    // the Realtime Database REST API.
  }
});
