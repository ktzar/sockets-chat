FROM ubuntu:14.04
MAINTAINER miguelmail@gmail.com

RUN sudo apt-get update
RUN sudo apt-get install -y nodejs npm git

RUN mkdir /app
RUN git clone https://github.com/ktzar/sockets-chat.git /app
RUN cd /app ; ls ; sudo npm install

CMD ["nodejs", "/app/server.js"]

EXPOSE 1080

