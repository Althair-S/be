import swaggerAutogen from "swagger-autogen";
import { serve } from "swagger-ui-express";
import { OutputFileType } from "typescript";



const outputFile = "./swagger_output.json";
const endpointsFiles = ["./src/routes/api.ts"];
const doc = {
  info: {
    version: "0.0.1",
    title: "Dokumentasi API Acara",
    description: "Dokumentasi API Acara",
  },
  servers : [
    {
      url: "http://localhost:3000/api",
      description: "Local Development",
    },
    {
      url: "https://be-two-theta.vercel.app/api",
      description: "Deploy Server",
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
    schemas: {
      RegisterRequest: {
        fullName: "full name",
        username: "username",
        email: "email",
        password: "password",
        confirmPassword: "password",
      },
      LoginRequest: {
        identifier: "username/email",
        password: "password",
      },
      ActivationRequest: {
        code: "activation code",
      },
      UpdateProfileRequest: {
        fullName: "full name",
        profilePicture: "fileUrl",
      },
      UpdatePasswordRequest: {
        oldPassword: "old password",
        password: "password",
        newPassword : "new password",
      },
      CreateCategoryRequest: {
        name: "",
        description: "",
        icon: "",
      },
      CreateEventRequest: {
        name : "",
        banner : "fileUrl",
        category : "category ObjectID",
        description : "",
        startDate : "yyyy-mm-dd hh:mm:ss",
        endDate : "yyyy-mm-dd hh:mm:ss",
        location : {
          region : 3274,
          coordinates : [0,0],
          address : "",
        },
        isOnline : false,
        isFeatured : false,
        isPublic : false,
      },
      RemoveMediaRequest: {
        fileUrl: "",
      },
      CreateBannerRequest: {
        title : "title",
        image : "fileUrl",
        isShow : false,
      },
      CreateTicketRequest: {
        name : "Ticket Name",
        price : 20000,
        event : "event ObjectID",
        quantity : 100,
        description : "Ticket Description",
      },
      CreateOrderRequest: {
        event : "event ObjectID",
        ticket : "ticket ObjectID",
        quantity : 1,
      },
      UpdateOrderRequest: {
        ticket : "ticket ObjectID",
        quantity : 1,
      },
    }
  },
};

swaggerAutogen ({openapi: "3.0.0"})(outputFile, endpointsFiles, doc);