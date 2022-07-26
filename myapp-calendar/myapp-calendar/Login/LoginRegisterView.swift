//
//  LoginRegisterView.swift
//  myapp-calendar
//
//  Created by Umran Jameel on 7/13/22.
//

import SwiftUI

struct LoginRegisterView: View {
    @AppStorage("userID") var userId = ""
    @AppStorage("accessToken") var accessToken = ""
    @AppStorage("username") var username = ""
    @AppStorage("password") var password = ""
    @AppStorage("firstName") var firstName = ""
    @AppStorage("lastName") var lastName = ""
    
    @State var usernameLocal: String = ""
    @State var passwordLocal: String = ""
    
    @State var incorrectLogin: Bool = false // for alert
    
    @State var showingSheet = false
    @State var showingForgotPasswordSheet = false
    
    @Binding var isLoggedin: Bool
    
    var body: some View {
        ZStack {
            Color("main").ignoresSafeArea()
            VStack(spacing: 55) {
                VStack(spacing: 5) {
                    Text("CALPAL \(Image(systemName: "calendar"))")
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .font(.system(size: 65))
                        .padding()
                    VStack {
                        Text("STAY")
                            .fontWeight(.light)
                            .foregroundColor(Color("text"))
                            .font(.system(size: 50))
                        Text("CONNECTED")
                            .fontWeight(.light)
                            .foregroundColor(Color("text"))
                            .font(.system(size: 50))
                        Text("We Manage Your Time So You Don't Have To")
                            .foregroundColor(Color("text"))
                            .font(.system(size: 18))
                            .italic()
                    }
                }
                VStack(spacing: 25) {
                    VStack(spacing: 10) {
                        TextField("Username", text: $usernameLocal)
                            .padding(10)
                            .background(Color("text"))
                            .cornerRadius(5)
                            .frame(width: 340)
                            .font(.system(size: 20, weight: .semibold))
                        SecureField("Password", text: $passwordLocal)
                            .padding(10)
                            .background(Color("text"))
                            .cornerRadius(5)
                            .frame(width: 340)
                            .font(.system(size: 20, weight: .semibold))
                        LargeButton(title: "Login", backgroundColor: Color("main"), foregroundColor: Color("text"), width: 200, height: 10) {
                            LoginRequest(login: self.usernameLocal, password: self.passwordLocal) { loginInfo in
                                if let loginInfo = loginInfo {
                                    if loginInfo.accessToken == "nil" {
                                        incorrectLogin = true
                                    } else {
                                        self.userId = loginInfo.id
                                        self.accessToken = loginInfo.accessToken
                                        self.username = self.usernameLocal
                                        self.password = self.passwordLocal
                                        self.firstName = loginInfo.firstName
                                        self.lastName = loginInfo.lastName
                                        isLoggedin = true
                                    }
                                } else {
                                    print("error")
                                }
                            }
                        }
                        Button("Forgot Password") {
                            showingForgotPasswordSheet.toggle()
                        }
                        .sheet(isPresented: $showingForgotPasswordSheet) {
                            ForgotPasswordSheetView()
                        }
                        .foregroundColor(Color("text"))
                        .font(.system(size: 16))
                        
                    }
                    Text("Or")
                        .fontWeight(.light)
                        .foregroundColor(Color("text"))
                        .font(.system(size: 20))
                    
                    LargeButton(title: "Sign Up", backgroundColor: Color("text"), foregroundColor: Color("main"), width: 200, height: 10) {
                        showingSheet.toggle()
                    }
                    .sheet(isPresented: $showingSheet) {
                        SignUpSheetView()
                    }
                    
                }
                Spacer()
                
                Text("COP4331 Group 9 Large Project")
                    .foregroundColor(Color("text"))
                    .font(.system(size: 15))
                    .fontWeight(.light)
            }
            .alert(isPresented: $incorrectLogin) {
                Alert(title: Text("Login/Password Incorrect"), dismissButton: .default(Text("Try Again")))
            }
        }
    }
}

struct LargeButtonStyle: ButtonStyle {
    
    let backgroundColor: Color
    let foregroundColor: Color
    let isDisabled: Bool
    
    func makeBody(configuration: Self.Configuration) -> some View {
        let currentForegroundColor = isDisabled || configuration.isPressed ? foregroundColor.opacity(0.3) : foregroundColor
        return configuration.label
            .padding()
            .foregroundColor(currentForegroundColor)
            .background(isDisabled || configuration.isPressed ? backgroundColor.opacity(0.3) : backgroundColor)
        
            .cornerRadius(5)
            .overlay(
                RoundedRectangle(cornerRadius: 5)
                    .stroke(currentForegroundColor, lineWidth: 1)
        )
            .font(Font.system(size: 20, weight: .semibold))
    }
}

struct LargeButton: View {
    
    private static let buttonHorizontalMargins: CGFloat = 20
    
    var backgroundColor: Color
    var foregroundColor: Color
    var width: CGFloat
    var height: CGFloat
    
    private let title: String
    private let action: () -> Void
    
    private let disabled: Bool
    
    init(title: String,
         disabled: Bool = false,
         backgroundColor: Color = Color.green,
         foregroundColor: Color = Color.white,
         width: CGFloat = 200, height: CGFloat = 10,
         action: @escaping () -> Void) {
        self.backgroundColor = backgroundColor
        self.foregroundColor = foregroundColor
        self.title = title
        self.action = action
        self.disabled = disabled
        self.width = width
        self.height = height
    }
    
    var body: some View {
        HStack {
            Spacer(minLength: LargeButton.buttonHorizontalMargins)
            Button(action:self.action) {
                Text(self.title)
                    .frame(width: self.width, height: self.height)
            }
            .buttonStyle(LargeButtonStyle(backgroundColor: backgroundColor,
                                          foregroundColor: foregroundColor,
                                          isDisabled: disabled))
                .disabled(self.disabled)
            Spacer(minLength: LargeButton.buttonHorizontalMargins)
        }
        .frame(maxWidth:.infinity)
    }
}


