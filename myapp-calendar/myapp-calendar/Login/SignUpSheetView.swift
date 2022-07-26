//
//  SignUpSheetView.swift
//  myapp-calendar
//
//  Created by Umran Jameel on 7/15/22.
//

import SwiftUI

struct SignUpSheetView: View {
    @Environment(\.dismiss) var dismiss
    
    @State var firstName = ""
    @State var lastName = ""
    @State var username = ""
    @State var email = ""
    @State var password = ""
    @State var confirmPassword = ""
    
    @State var errorMessage = ""
    
    @State var verifyEmailAlert: Bool = false
    @State var serverErrorAlert: Bool = false
    
    var body: some View {
        ZStack {
            Color("main").ignoresSafeArea()
            VStack(spacing: 10) {
                Text("Sign Up")
                    .foregroundColor(Color("text"))
                    .font(.system(size: 40))
                    .fontWeight(.semibold)
                
                VStack(spacing: 25) {
                    TextField("First Name", text: $firstName)
                        .padding(10)
                        .background(Color("text"))
                        .cornerRadius(5)
                        .frame(width: 360)
                        .font(.system(size: 20, weight: .semibold))
                    TextField("Last Name", text: $lastName)
                        .padding(10)
                        .background(Color("text"))
                        .cornerRadius(5)
                        .frame(width: 360)
                        .font(.system(size: 20, weight: .semibold))
                    TextField("Username", text: $username)
                        .padding(10)
                        .background(Color("text"))
                        .cornerRadius(5)
                        .frame(width: 360)
                        .font(.system(size: 20, weight: .semibold))
                    TextField("Email", text: $email)
                        .padding(10)
                        .background(Color("text"))
                        .cornerRadius(5)
                        .frame(width: 360)
                        .font(.system(size: 20, weight: .semibold))
                    SecureField("Password", text: $password)
                        .padding(10)
                        .background(Color("text"))
                        .cornerRadius(5)
                        .frame(width: 360)
                        .font(.system(size: 20, weight: .semibold))
                    SecureField("Confirm Password", text: $confirmPassword)
                        .padding(10)
                        .background(Color("text"))
                        .cornerRadius(5)
                        .frame(width: 360)
                        .font(.system(size: 20, weight: .semibold))
                    Text(errorMessage)
                        .foregroundColor(Color("text"))
                        .fontWeight(.semibold)
                        .font(.system(size: 15))
                }
                .padding(20)
                
                LargeButton(title: "Sign Up", backgroundColor: Color("main"), foregroundColor: Color("text"), width: 100, height: 30) {
                    if firstName.isEmpty {
                        errorMessage = "Please Enter a First Name"
                    } else if lastName.isEmpty {
                        errorMessage = "Please Enter a Last Name"
                    } else if username.isEmpty {
                        errorMessage = "Please Enter a Username"
                    } else if !validateEmail(email: self.email) {
                        errorMessage = "Please Enter a Valid Email Address"
                    } else if password.isEmpty {
                        errorMessage = "Please Enter a Password"
                    } else if password != confirmPassword {
                        errorMessage = "Passwords Do Not Match"
                    } else {
                        errorMessage = ""
                        RegisterRequest(firstName: self.firstName, lastName: self.lastName, username: self.username, password: self.password, email: self.email) { response in
                            if let response = response {
                                if response.error.isEmpty {
                                    verifyEmailAlert = true
                                } else {
                                    serverErrorAlert = true
                                }
                            } else {
                                serverErrorAlert = true
                            }
                        }
                    }
                }
                
                Spacer()
            }
            .padding(40)
            .alert(isPresented: $verifyEmailAlert) {
                Alert(title: Text("Email Verification Required"), message: Text("Please verify your email using the link sent to your email address. Then, you may return to login."), dismissButton: .default(Text("OK"), action: { dismiss() }))
            }
            .alert(isPresented: $serverErrorAlert) {
                Alert(title: Text("Server Connection Error"), message: Text("Please try again later"), dismissButton: .default(Text("OK")))
            }
            
        }
    }
}

