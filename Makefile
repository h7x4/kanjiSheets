.DEFAULT_GOAL := main.pdf

main.pdf: main.tex jishoScrape/index.js title/titlepage.tex $(data)
	for i in $$(seq 5 -1 1); do node jishoScrape/index.js n$$i; done
	xelatex main.tex

#TODO: Make this modular, fix the index.js target.

jishoScrape/index.js: jishoScrape/index.js $(wildcard jishoScrape/src/*.js)
	for i in $$(seq 1 5); do node jishoScrape/index.js n$$i; done

data/pages/n%.tex:  data/txt/n%.txt
	node jishoScrape/index.js n%

data/tables/n%.tex:  data/txt/n%.txt
	node jishoScrape/index.js n%

.PHONY: clean
clean:
	rm data/pages/*
	rm data/tables/*
	rm main.aux main.log main.out main.toc main.synctex.gz