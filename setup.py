from setuptools import setup

setup(name='ng_whistles_webapp',
      version='1',
      description='Nightingale whistle detector webapp',
      author='Martin',
      author_email='coder@posteo.de',
      license='...',
      install_requires = [
          'flask',
          'waitress',
          'ng_whistles @ git+https://github.com/atomfried/ng_whistles'
          ],
      zip_safe=False)
