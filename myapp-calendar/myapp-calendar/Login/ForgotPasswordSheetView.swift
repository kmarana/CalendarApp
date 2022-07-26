//
//  ForgotPasswordSheetView.swift
//  myapp-calendar
//
//  Created by Umran Jameel on 7/21/22.
//

import SwiftUI

struct ForgotPasswordSheetView: View {
    @Environment(\.dismiss) var dismiss
    
    @State var resetEmail = ""
    
    @State var invalidEmail = false
    @State var successAlert = false
    
    @State var errorMessage = ""
    
    var body: some View {
        ZStack {
            Color("main").ignoresSafeArea()
            VStack(spacing: 10) {
                Text("Reset Password")
                    .foregroundColor(Color("text"))
                    .font(.system(size: 40))
                    .fontWeight(.semibold)
                    .padding()
                Text("Please enter your email")
                    .foregroundColor(Color("text"))
                    .font(.system(size: 20))
                    .fontWeight(.light)
                TextField("Email", text: $resetEmail)
                    .padding(10)
                    .background(Color("text"))
                    .cornerRadius(5)
                    .frame(width: 360)
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(Color.black)
                Text(errorMessage)
                    .foregroundColor(Color("text"))
                    .fontWeight(.semibold)
                    .font(.system(size: 15))
                    .alert(isPresented: $successAlert) {
                        Alert(title: Text("Please check your inbox"), message: Text("Click the link sent to your email to reset your password."), dismissButton: .default(Text("Ok")))
                    }
                LargeButton(title: "Reset Password", backgroundColor: Color("text"), foregroundColor: Color("main"), width: 150, height: 20) {
                    if resetEmail.isEmpty {
                        errorMessage = "Please Enter Your Email Address"
                    } else if !validateEmail(email: resetEmail) {
                        errorMessage = "Invalid Email"
                    } else {
                        forgotPasswordRequest(email: resetEmail) { response in
                            if response != nil {
                                successAlert.toggle()
                            } else {
                                print("here")
                                invalidEmail = true
                            }
                        }
                    }
                }
                .alert(isPresented: $invalidEmail) {
                    Alert(title: Text("Account unknown"), message: Text("Could not find account associated with that email."), dismissButton: .default(Text("Try Again")))
                }
                Spacer()
            }
        }
        
    }
}

