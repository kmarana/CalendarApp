//
//  API.swift
//  myapp-calendar
//
//  Created by Umran Jameel on 7/13/22.
//

import Foundation

struct Login: Decodable {
    let accessToken: String
    var firstName: String
    let lastName: String
    let id: String
}

struct LoginError: Decodable {
    let error: String
}

struct Register: Decodable {
    let error: String
}

struct ForgotPassword: Decodable {
    let passToken: String
    let error: String
}

struct FetchEvents: Decodable, Hashable {
    let results: [Event]
}


struct Event: Decodable, Hashable {
    let Title: String
    let date: String
}


func LoginRequest(login: String, password: String, completion: @escaping(_ loginInfo: Login?) -> ()) {
    let Url = String(format: "https://myapp-calendar.herokuapp.com/api/login")
    guard let serviceUrl = URL(string: Url) else { return }
    let parameters: [String: Any] = [
        "login":"\(login)",
        "password":"\(password)"
    ]
    var request = URLRequest(url: serviceUrl)
    request.httpMethod = "POST"
    request.setValue("Application/json", forHTTPHeaderField: "Content-Type")
    guard let httpBody = try? JSONSerialization.data(withJSONObject: parameters, options: []) else {
        return
    }
    request.httpBody = httpBody
    request.timeoutInterval = 20
    let session = URLSession.shared
    session.dataTask(with: request) { (data, response, error) in
        if let data = data {
            do {
                let ret = try JSONDecoder().decode(Login.self, from: data)
                completion(ret)
            } catch {
                do {
                    _ = try JSONDecoder().decode(LoginError.self, from: data)
                    let errorString = "{\"accessToken\":\"nil\",\"firstName\":\"nil\",\"lastName\":\"nil\",\"id\":\"nil\"}"
                    completion(try JSONDecoder().decode(Login.self, from: Data(errorString.utf8)))
                } catch {
                    completion(nil)
                }
            }
        }
    }.resume()
}

func RegisterRequest(firstName: String, lastName: String, username: String, password: String, email: String, completion: @escaping(_ loginInfo: Register?) -> ()) {
    let Url = String(format: "https://myapp-calendar.herokuapp.com/api/register")
    guard let serviceUrl = URL(string: Url) else { return }
    let parameters: [String: Any] = [
        "firstName":"\(firstName)",
        "lastName":"\(lastName)",
        "username":"\(username)",
        "password":"\(password)",
        "email":"\(email)"
    ]
    var request = URLRequest(url: serviceUrl)
    request.httpMethod = "POST"
    request.setValue("Application/json", forHTTPHeaderField: "Content-Type")
    guard let httpBody = try? JSONSerialization.data(withJSONObject: parameters, options: []) else {
        return
    }
    request.httpBody = httpBody
    request.timeoutInterval = 20
    let session = URLSession.shared
    session.dataTask(with: request) { (data, response, error) in
        if let data = data {
            do {
                let ret = try JSONDecoder().decode(Register.self, from: data)
                completion(ret)
            } catch {
                completion(nil)
            }
        }
    }.resume()
}

func forgotPasswordRequest(email: String, completion: @escaping(_ loginInfo: ForgotPassword?) -> ()) {
    let Url = String(format: "https://myapp-calendar.herokuapp.com/api/forgotPassword")
    guard let serviceUrl = URL(string: Url) else { return }
    let parameters: [String: Any] = [
        "email":"\(email)"
    ]
    var request = URLRequest(url: serviceUrl)
    request.httpMethod = "POST"
    request.setValue("Application/json", forHTTPHeaderField: "Content-Type")
    guard let httpBody = try? JSONSerialization.data(withJSONObject: parameters, options: []) else {
        return
    }
    request.httpBody = httpBody
    request.timeoutInterval = 20
    let session = URLSession.shared
    session.dataTask(with: request) { (data, response, error) in
        if let data = data {
            do {
                let ret = try JSONDecoder().decode(ForgotPassword.self, from: data)
                completion(ret)
            } catch {
                completion(nil)
            }
        }
    }.resume()
}

func fetchEventsRequest(calId: String, userId: String, jwtToken: String, completion: @escaping(_ response: FetchEvents?) -> ()) {
    let Url = String(format: "https://myapp-calendar.herokuapp.com/api/fetchEvents")
    guard let serviceUrl = URL(string: Url) else { return }
    let parameters: [String: Any] = [
        "userId":"\(userId)",
        "calId":"\(calId)",
        "jwtToken":"\(jwtToken)"
    ]
    var request = URLRequest(url: serviceUrl)
    request.httpMethod = "POST"
    request.setValue("Application/json", forHTTPHeaderField: "Content-Type")
    guard let httpBody = try? JSONSerialization.data(withJSONObject: parameters, options: []) else {
        return
    }
    request.httpBody = httpBody
    request.timeoutInterval = 20
    let session = URLSession.shared
    session.dataTask(with: request) { (data, response, error) in
        if let data = data {
            do {
                let ret = try JSONDecoder().decode(FetchEvents.self, from: data)
                completion(ret)
            } catch {
                completion(nil)
            }
        }
    }.resume()
}



