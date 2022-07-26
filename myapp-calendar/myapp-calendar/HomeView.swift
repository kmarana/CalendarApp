//
//  HomeView.swift
//  myapp-calendar
//
//  Created by Umran Jameel on 7/13/22.
//

import SwiftUI

struct HomeView: View {
    @AppStorage("userID") var userId = ""
    @AppStorage("accessToken") var accessToken = ""
    @AppStorage("username") var username = ""
    @AppStorage("password") var password = ""
    @AppStorage("firstName") var firstName = ""
    @AppStorage("lastName") var lastName = ""
    @AppStorage("Demo Bruh") var calId = "62d06262fd00963e5319a8cf"
    @Binding var isLoggedin: Bool
    
    @State var searchText: String = ""
    @State var parsed: Bool = false
    
    @State var calendarEvents: [String: [Event]] = [:]
    
    @State private var date = Date()
    
    var body: some View {
        fetchEventsRequest(calId: self.calId, userId: self.userId, jwtToken: self.accessToken) { response in
            if let response = response {
                if !parsed {
                    parseData(response: response)
                    parsed = true
                }
            }
        }
        return ZStack {
            Color("calendar-background").ignoresSafeArea()
            VStack {
                HStack {
                    Text("Hello, \(firstName) \(lastName)!")
                        .fontWeight(.light)
                        .font(.system(size: 20))
                    Spacer()
                    Button("Logout") {
                        self.userId = ""
                        self.accessToken = ""
                        self.username = ""
                        self.password = ""
                        self.firstName = ""
                        self.lastName = ""
                        isLoggedin = false
                    }
                    .foregroundColor(Color("calendar"))
                    .font(.system(size: 20))
                }
                .padding()
                DatePicker("MyCal", selection: $date)
                    .datePickerStyle(GraphicalDatePickerStyle())
                    .padding(.leading)
                    .padding(.trailing)
                HStack {
                    TextField("\(Image(systemName: "magnifyingglass")) Search Events", text: $searchText)
                        .padding()
                        .foregroundColor(Color.black)
                        .background(Color("search-bar"))
                        .frame(width: 350, height: 35)
                        .cornerRadius(10)
                }
                .padding()
                ScrollView {
                    ForEach(calendarEvents["\(Calendar.current.component(.month, from: date))/\(Calendar.current.component(.day, from: date))/\(Calendar.current.component(.year, from: date))"]?.filter { $0.Title.lowercased().contains(searchText.lowercased()) || searchText.isEmpty } ?? [], id: \.self) { event in
                        RoundedRectangle(cornerRadius: 10)
                            .foregroundColor(Color.white)
                            .frame(width: 320, height: 45)
                            .overlay(Text(event.Title))
                    }
                }
                
                Spacer()
            }
        }
    }
    
    func parseData(response: FetchEvents) {
        for event in response.results {
            if calendarEvents[event.date] == nil {
                calendarEvents[event.date] = [event]
            } else {
                calendarEvents[event.date]!.append(event)
            }
        }
    }
}


