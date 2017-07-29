FROM wernight/phantomjs

USER root

RUN echo "deb http://ftp.uk.debian.org/debian jessie-backports main" >> /etc/apt/sources.list && \
    apt-get update -y && \
    apt-get install -y mecab-ipadic-utf8 && \
    apt-get install -y git mongodb ffmpeg mecab wget redis-server build-essential fontconfig && \
    mkdir ~/.ssh && \
    ssh-keyscan -t rsa github.com > ~/.ssh/known_hosts && \
    wget -qO- https://deb.nodesource.com/setup_8.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/* && \
    wget -qO /usr/local/share/fonts/noto.otf https://github.com/googlei18n/noto-cjk/raw/master/NotoSansCJKjp-Regular.otf && \
    fc-cache -v /usr/local/share/fonts/

COPY src/run.sh src/dummy.js /

COPY package.json package-lock.json /rem-v2/

WORKDIR /rem-v2
RUN npm install

RUN mkdir temp audio db
COPY kanji/ kanji/
COPY config/ config/
COPY rem_translate/ rem_translate/
COPY src/ src/

RUN useradd -m rem && chmod -R 777 /rem-v2 /run.sh /dummy.js
USER rem

ENTRYPOINT ["/bin/sh"]
CMD ["/run.sh"]
