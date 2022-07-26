//
//  myapp_calendarApp.swift
//  myapp-calendar
//
//  Created by Umran Jameel on 7/13/22.
//

import SwiftUI

@main
struct myapp_calendarApp: App {
    @AppStorage("userID") var userId = ""
    @AppStorage("accessToken") var accessToken = ""
    @AppStorage("username") var username = ""
    @AppStorage("password") var password = ""
    
    
    @State var isLoggedin = false
    
    var body: some Scene {
        if !userId.isEmpty {
            LoginRequest(login: self.username, password: self.password) { loginInfo in
                if let loginInfo = loginInfo {
                    print("\(self.username), \(self.password)")
                    self.accessToken = loginInfo.accessToken
                } else {
                    print("error")
                }
            }
        }
        return WindowGroup {
            if !userId.isEmpty {
                HomeView(isLoggedin: $isLoggedin)
            } else {
                LoginRegisterView(isLoggedin: $isLoggedin)
            }
        }
    }
}
