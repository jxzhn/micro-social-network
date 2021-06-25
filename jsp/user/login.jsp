<%@ page language="java" contentType="application/json" pageEncoding="UTF-8"%>
<%@ page import="java.util.*, java.io.*" %>
<%@ page import="org.json.*" %>
<%@ page import="java.sql.*" %>
<%-- <%@ page import="com.alibaba.fastjson.*" %> --%>

<%!
String getPostData(InputStream in, int size, String charset) {
    if (in != null && size > 0) {
        byte[] buf = new byte[size];
        try{
            in.read(buf);
            if  (charset == null || charset.length() == 0) {
                return new String(buf);
            } else {
                return new String(buf,charset);
            }
        } catch (IOException e){
            e.printStackTrace();
        }
    }
    return null;
}
%>

<%
String msg = "";
int code = 0;
if (request.getMethod().equalsIgnoreCase("post")) {
    //获得请求体
    String postbody = getPostData(request.getInputStream(), request.getContentLength(), null);
    JSONObject postData = new JSONObject(postbody);

    String userId = (String)postData.get("id");
    String password = (String)postData.get("password");


    //连接数据库
    String connectString = "jdbc:mysql://localhost:3306/wwb?autoReconnect=true" + 
        "&useUnicode=true&characterEncoding=UTF-8";
    //String connectString = "jdbc:mysql://localhost:3306/wwb?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8";
    try {
        Class.forName("com.mysql.jdbc.Driver");
        //Class.forName("com.mysql.cj.jdbc.Driver");
        Connection conn = DriverManager.getConnection(connectString, "root", "ye1397546");
        PreparedStatement stmt = conn.prepareStatement("select * from users where ID like ?");
        stmt.setString(1, userId);
        
        //返回的表格
        ResultSet rs = stmt.executeQuery();
        if (rs.next()) {
            String pw = rs.getString("password");
            if (pw.equals(password)) {
                session.setAttribute("id",userId);
                code = 0;
                msg = "success!";
            } else {
                code = 1002;
                msg = "password is wrong!";
            }
        } else {
            code = 1001;
            msg = "The user does not exist！";
        }

        rs.close();
        stmt.close();
        conn.close();
    } catch (Exception e) {
        code = -1;
        msg = e.getMessage();
    }


    JSONObject retval = new JSONObject();
    retval.put("code",code);
    retval.put("msg",msg);
    JSONObject data = new JSONObject();
    retval.put("data",data);
    out.print(retval.toString());
}

%>